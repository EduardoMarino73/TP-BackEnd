export type UserRole = "viewer" | "administrator";

/** Safe account data shared by viewers and administrators. */
export class User {
    constructor(
        public id_user: number,
        public user_name: string,
        public first_name: string,
        public last_name: string,
        public email: string,
        public role: UserRole,
        public active: boolean,
    ) { }
}
