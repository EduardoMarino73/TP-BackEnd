import { orm } from "../Shared/database/connections.js";
import { pickDefined } from "../Shared/repository.js";
import { Administrator } from "./administrator/administrator.entity.js";
import { User, UserRole } from "./user.entity.js";
import { UserSession } from "./user_session.entity.js";
import { Viewer } from "./viewer/viewer.entity.js";

/** Fields an account owner may edit. */
const EDITABLE_FIELDS = ["user_name", "first_name", "last_name", "email"] as const;

/** Database operations shared by viewer and administrator features. */
export class UserRepository {
    /** The EntityManager of the current request (see RequestContext in index.ts). */
    private get em() {
        return orm.em;
    }

    /** Returns every account. The password hash is lazy, so it is not even read. */
    async findAll(): Promise<User[]> {
        return this.em.find(User, {}, { orderBy: { id_user: "asc" } });
    }

    /** Looks up an account by its database ID. */
    async findById(id: number): Promise<User | undefined> {
        return (await this.em.findOne(User, id)) ?? undefined;
    }

    /** Finds an account by email or username, with the password hash needed to check a login. */
    async findByLogin(login: string): Promise<User | undefined> {
        const user = await this.em.findOne(
            User,
            { $or: [{ email: login }, { user_name: login }] },
            { populate: ["password_hash"] },
        );
        return user ?? undefined;
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return (await this.em.findOne(User, { email })) ?? undefined;
    }

    async findByUsername(username: string): Promise<User | undefined> {
        return (await this.em.findOne(User, { user_name: username })) ?? undefined;
    }

    /** Creates a viewer or an administrator account. The hash is never returned (hidden). */
    async create(input: {
        user_name: string;
        first_name: string;
        last_name: string;
        email: string;
        password_hash: string;
        role: UserRole;
    }): Promise<User> {
        const AccountClass = input.role === "administrator" ? Administrator : Viewer;
        const user = new AccountClass(
            input.user_name,
            input.first_name,
            input.last_name,
            input.email,
            input.password_hash,
        );
        await this.em.persist(user).flush();
        return user;
    }

    /** Updates only the editable fields supplied by the account owner. */
    async updateProfile(
        id: number,
        input: Partial<Pick<User, "user_name" | "first_name" | "last_name" | "email">>,
    ): Promise<User | undefined> {
        const user = await this.findById(id);
        if (!user) return undefined;
        this.em.assign(user, pickDefined(input, EDITABLE_FIELDS));
        await this.em.flush();
        return user;
    }

    /** Enables or disables an account. */
    async setActive(id: number, active: boolean): Promise<User | undefined> {
        const user = await this.findById(id);
        if (!user) return undefined;
        user.active = active;
        await this.em.flush();
        return user;
    }

    /** Stores a hash of the bearer token rather than the token itself. */
    async saveSession(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
        const session = new UserSession(this.em.getReference(User, userId), tokenHash, expiresAt);
        await this.em.persist(session).flush();
    }

    /** Returns the account for a valid, unexpired session. */
    async findSession(tokenHash: string): Promise<User | undefined> {
        const session = await this.em.findOne(
            UserSession,
            { tokenHash, expiresAt: { $gt: new Date() }, user: { active: true } },
            { populate: ["user"] },
        );
        return session?.user;
    }

    /** Removes a session, which makes its bearer token unusable. */
    async deleteSession(tokenHash: string): Promise<void> {
        await this.em.nativeDelete(UserSession, { tokenHash });
    }
}
