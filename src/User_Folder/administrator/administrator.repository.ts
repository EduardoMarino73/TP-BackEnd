import { orm } from "../../Shared/database/connections.js";
import { UserRepository } from "../user.repository.js";
import { AppealRepository } from "../../Appeal/appeal.repository.js";
import { Administrator } from "./administrator.entity.js";

/** Administrator-specific access to the shared users table. */
export class AdministratorRepository {
    private readonly users = new UserRepository();
    private readonly appeals = new AppealRepository();

    /** The EntityManager of the current request (see RequestContext in index.ts). */
    private get em() {
        return orm.em;
    }

    async findAll(): Promise<Administrator[]> {
        // loading the Administrator subclass only matches users whose role is 'administrator'
        const administrators = await this.em.find(Administrator, {}, { orderBy: { id_user: "asc" } });
        const pendingAppeals = await this.appeals.findPending();
        administrators.forEach((administrator) => { administrator.pendingAppeals = pendingAppeals; });
        return administrators;
    }

    /** Lists all account roles for the administrator's user-management view. */
    findAllUsers() {
        return this.users.findAll();
    }

    /** Finds one account only when it has the administrator role. */
    async findOne(id: number): Promise<Administrator | undefined> {
        const administrator = await this.em.findOne(Administrator, id);
        if (!administrator) return undefined;
        administrator.pendingAppeals = await this.appeals.findPending();
        return administrator;
    }

    /** Changes the active status only when the target is an administrator. */
    async setActive(id: number, active: boolean): Promise<Administrator | undefined> {
        const administrator = await this.findOne(id);
        if (!administrator) return undefined;
        administrator.active = active;
        await this.em.flush();
        return administrator;
    }

    /** Changes the active status of any account. */
    setUserActive(id: number, active: boolean) {
        return this.users.setActive(id, active);
    }
}
