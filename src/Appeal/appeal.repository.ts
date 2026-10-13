import { LockMode } from "@mikro-orm/core";
import { orm } from "../Shared/database/connections.js";
import { Complaint, ContentReport } from "../Report/complaint.entity.js";
import { findContent, ownedContentTargets } from "../Report/complaint.repository.js";
import { Appeal } from "./appeal.entity.js";

/** Database access for content-owner appeals and administrator review queues. */
export class AppealRepository {
    /** The EntityManager of the current request (see RequestContext in index.ts). */
    private get em() {
        return orm.em;
    }

    /** Returns every appeal. */
    async findAll(): Promise<Appeal[]> {
        return this.em.find(Appeal, {}, { orderBy: { id: "asc" } });
    }

    /** Returns appeals awaiting an administrator's decision. */
    async findPending(): Promise<Appeal[]> {
        return this.em.find(Appeal, { reviewed: false }, { orderBy: { id: "asc" } });
    }

    /** Returns appeals filed against content uploaded by a viewer. */
    async findByViewer(viewerId: number): Promise<Appeal[]> {
        const targets = await ownedContentTargets(this.em, viewerId);
        if (targets.length === 0) return [];
        const cases = await this.em.find(Complaint, { $or: targets });
        return this.em.find(
            Appeal,
            { reportId: { $in: cases.map((complaint) => complaint.id) } },
            { orderBy: { id: "asc" } },
        );
    }

    /** Finds an appeal by its ID. */
    async findOne(id: number): Promise<Appeal | undefined> {
        return (await this.em.findOne(Appeal, id)) ?? undefined;
    }

    /** Finds the appeal associated with a moderation case. */
    async findByReport(reportId: number): Promise<Appeal | undefined> {
        return (await this.em.findOne(Appeal, { reportId })) ?? undefined;
    }

    /** Creates an appeal for a moderation case. */
    async create(input: {
        description: string;
        reportId: number;
    }): Promise<Appeal> {
        const appeal = new Appeal(input.description, input.reportId);
        await this.em.persist(appeal).flush();
        return appeal;
    }

    /**
     * Deletes an appeal that was not reviewed yet and puts its case back to 'pending',
     * so the owner can appeal again. Returns false when it was reviewed in the meantime.
     */
    async withdraw(id: number): Promise<boolean> {
        return this.em.transactional(async (em) => {
            const appeal = await em.findOne(
                Appeal,
                { id, reviewed: false },
                { lockMode: LockMode.PESSIMISTIC_WRITE },
            );
            if (!appeal) return false;

            em.remove(appeal);
            await em.nativeUpdate(Complaint, { id: appeal.reportId, status: "appealed" }, { status: "pending" });
            return true;
        });
    }

    /**
     * Resolves an appeal and applies its moderation result atomically.
     * Rejecting the appeal upholds the complaint and suspends the content.
     */
    async resolve(
        id: number,
        administratorId: number,
        decision: NonNullable<Appeal["decision"]>,
        minimumReportCount: number,
    ): Promise<{ appeal: Appeal; reportCount: number; suspended: boolean } | undefined> {
        return this.em.transactional(async (em) => {
            const appeal = await em.findOne(Appeal, id, { lockMode: LockMode.PESSIMISTIC_WRITE });
            if (!appeal || appeal.reviewed) return undefined;

            const complaint = await em.findOneOrFail(Complaint, appeal.reportId, { lockMode: LockMode.PESSIMISTIC_WRITE });
            complaint.status = decision === "approved" ? "dismissed" : "upheld";

            const reportCount = await em.count(ContentReport, {
                targetType: complaint.targetType,
                targetId: complaint.targetId,
            });
            const suspended = decision === "rejected"
                && reportCount >= minimumReportCount;

            if (suspended) {
                const content = await findContent(em, complaint.targetType, complaint.targetId);
                if (!content) throw new Error("Reported content could not be suspended");
                content.state = "suspended";
            }

            appeal.administratorId = administratorId;
            appeal.reviewed = true;
            appeal.decision = decision;
            appeal.reviewedAt = new Date();

            // the changes above are written when the transaction commits
            return { appeal, reportCount, suspended };
        });
    }
}
