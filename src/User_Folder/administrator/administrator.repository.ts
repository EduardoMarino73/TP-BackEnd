import { UserRepository } from "../user.repository.js";
import { AppealRepository } from "../../Appeal/appeal.repository.js";
import { Administrator } from "./administrator.entity.js";

/** Administrator-specific access to the shared users table. */
export class AdministratorRepository {
    private readonly users = new UserRepository();
    private readonly appeals = new AppealRepository();

    async findAll(): Promise<Administrator[]> {
        const [users, pendingAppeals] = await Promise.all([
            this.users.findAll(),
            this.appeals.findPending(),
        ]);
        return users
            .filter((user) => user.role === "administrator")
            .map((user) => new Administrator(
                user.id_user,
                user.user_name,
                user.first_name,
                user.last_name,
                user.email,
                user.active,
                pendingAppeals,
            ));
    }

    /** Lists all account roles for the administrator's user-management view. */
    findAllUsers() {
        return this.users.findAll();
    }

    /** Finds one account only when it has the administrator role. */
    async findOne(id: number): Promise<Administrator | undefined> {
        const user = await this.users.findById(id);
        if (!user || user.role !== "administrator") return undefined;
        const pendingAppeals = await this.appeals.findPending();
        return new Administrator(
            user.id_user,
            user.user_name,
            user.first_name,
            user.last_name,
            user.email,
            user.active,
            pendingAppeals,
        );
    }

    /** Changes the active status only when the target is an administrator. */
    async setActive(id: number, active: boolean): Promise<Administrator | undefined> {
        const existing = await this.findOne(id);
        if (!existing) return undefined;
        await this.users.setActive(id, active);
        return this.findOne(id);
    }

    /** Changes the active status of any account. */
    setUserActive(id: number, active: boolean) {
        return this.users.setActive(id, active);
    }
}
