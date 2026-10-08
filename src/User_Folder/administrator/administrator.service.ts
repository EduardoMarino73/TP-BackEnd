import { UserRepository } from "../user.repository.js";
import { AppealRepository } from "../../Appeal/appeal.repository.js";
import { Appeal } from "../../Appeal/appeal.entity.js";
import { REPORTS_PER_COMPLAINT } from "../../Report/report.service.js";
import { Administrator } from "./administrator.entity.js";
import { AdministratorRepository } from "./administrator.repository.js";

/** Applies administrator account rules before accessing the repositories. */
export class AdministratorService {
    private readonly appeals = new AppealRepository();

    constructor(
        private readonly administrators = new AdministratorRepository(),
        private readonly users = new UserRepository(),
    ) { }

    list(): Promise<Administrator[]> {
        return this.administrators.findAll();
    }

    listUsers() {
        return this.administrators.findAllUsers();
    }

    listPendingAppeals() {
        return this.appeals.findPending();
    }

    findOne(id: number): Promise<Administrator | undefined> {
        if (!Number.isSafeInteger(id) || id < 1) return Promise.resolve(undefined);
        return this.administrators.findOne(id);
    }

    setActive(id: number, active: boolean): Promise<Administrator | undefined> {
        if (!Number.isSafeInteger(id) || id < 1) return Promise.resolve(undefined);
        return this.administrators.setActive(id, active);
    }

    setUserActive(id: number, active: boolean) {
        if (!Number.isSafeInteger(id) || id < 1) return Promise.resolve(undefined);
        return this.administrators.setUserActive(id, active);
    }

    /** Resolves an appeal and applies the three-report content removal rule. */
    resolveAppeal(
        appealId: number,
        administratorId: number,
        decision: NonNullable<Appeal["decision"]>,
    ) {
        if (!Number.isSafeInteger(appealId) || appealId < 1) {
            return Promise.resolve(undefined);
        }

        return this.appeals.resolve(
            appealId,
            administratorId,
            decision,
            REPORTS_PER_COMPLAINT,
        );
    }

    /** Creates an administrator account using a hash prepared by the controller. */
    async create(input: {
        user_name: string;
        first_name: string;
        last_name: string;
        email: string;
        password_hash: string;
    }): Promise<Administrator> {
        const user = await this.users.create({ ...input, role: "administrator" });
        return new Administrator(
            user.id_user,
            user.user_name,
            user.first_name,
            user.last_name,
            user.email,
            user.active,
        );
    }
}
