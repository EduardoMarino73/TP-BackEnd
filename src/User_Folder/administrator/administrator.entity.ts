import { Entity, Property } from "@mikro-orm/core";
import { User } from "../user.entity.js";
import { Appeal } from "../../Appeal/appeal.entity.js";

/**
 * Administrator account and the appeals awaiting its review.
 * pendingAppeals is not a column (persist: false): AdministratorRepository fills it.
 */
@Entity({ discriminatorValue: "administrator" })
export class Administrator extends User {
    @Property({ persist: false, type: "json" })
    pendingAppeals?: Appeal[];

    constructor(
        user_name: string,
        first_name: string,
        last_name: string,
        email: string,
        password_hash?: string,
    ) {
        super(user_name, first_name, last_name, email, "administrator", password_hash);
        this.pendingAppeals = [];
    }
}
