import { Entity, Enum, PrimaryKey, PrimaryKeyProp, Property } from "@mikro-orm/core";

export type UserRole = "viewer" | "administrator";

/**
 * Safe account data shared by viewers and administrators.
 * Both live in the users table: the role column tells which subclass a row is
 * (single table inheritance), so loading a user returns a Viewer or an Administrator.
 */
@Entity({
    tableName: "users",
    discriminatorColumn: "role",
    discriminatorMap: { viewer: "Viewer", administrator: "Administrator" },
})
export class User {
    /** Tells the ORM's types that the primary key is id_user (it is not called id). */
    [PrimaryKeyProp]?: "id_user";

    @PrimaryKey()
    id_user!: number;

    @Property({ length: 50 })
    user_name: string;

    @Property({ length: 100 })
    first_name: string;

    @Property({ length: 100 })
    last_name: string;

    @Property({ length: 254 })
    email: string;

    @Enum({ items: ["viewer", "administrator"] })
    role: UserRole;

    @Property()
    active: boolean = true;

    /** Only loaded to check a login password (lazy) and never sent in a response (hidden). */
    @Property({ hidden: true, lazy: true })
    password_hash?: string;

    constructor(
        user_name: string,
        first_name: string,
        last_name: string,
        email: string,
        role: UserRole,
        password_hash?: string,
    ) {
        this.user_name = user_name;
        this.first_name = first_name;
        this.last_name = last_name;
        this.email = email;
        this.role = role;
        this.password_hash = password_hash;
    }
}
