import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { User } from "./user.entity.js";

/** A login session. Only the SHA-256 hash of the bearer token is stored, never the token. */
@Entity({ tableName: "user_sessions" })
export class UserSession {
    @PrimaryKey({ type: "bigint" })
    id!: string;

    @ManyToOne(() => User, { fieldName: "user_id" })
    user: User;

    @Property({ length: 64 })
    tokenHash: string;

    @Property()
    expiresAt: Date;

    constructor(user: User, tokenHash: string, expiresAt: Date) {
        this.user = user;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
    }
}
