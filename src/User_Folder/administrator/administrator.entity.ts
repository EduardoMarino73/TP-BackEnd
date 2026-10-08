import { User } from "../user.entity.js";
import { Appeal } from "../../Appeal/appeal.entity.js";

/** Administrator account and the appeals awaiting its review. */
export class Administrator extends User {
    constructor(
        id_user: number,
        user_name: string,
        first_name: string,
        last_name: string,
        email: string,
        active: boolean,
        public pendingAppeals: Appeal[] = [],
    ) {
        super(id_user, user_name, first_name, last_name, email, "administrator", active);
    }
}
