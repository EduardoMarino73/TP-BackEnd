import { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "../Shared/database/connections.js";
import { User, UserRole } from "./user.entity.js";

/** A row from `users`; the password hash is selected only for sign-in. */
export type UserRow = RowDataPacket & {
    id_user: number;
    user_name: string;
    first_name: string;
    last_name: string;
    email: string;
    password_hash?: string;
    role: UserRole;
    active: number;
};

const USER_COLUMNS = "id_user, user_name, first_name, last_name, email, role, active";

/** Converts database values into the safe public account model. */
function toUser(row: UserRow): User {
    return new User(
        row.id_user,
        row.user_name,
        row.first_name,
        row.last_name,
        row.email,
        row.role,
        Boolean(row.active),
    );
}

/** Database operations shared by viewer and administrator features. */
export class UserRepository {
    /** Returns every account without exposing password hashes. */
    async findAll(): Promise<User[]> {
        const [rows] = await db.query<UserRow[]>(
            `SELECT ${USER_COLUMNS} FROM users ORDER BY id_user`,
        );
        return rows.map(toUser);
    }

    /** Looks up a public account by its database ID. */
    async findById(id: number): Promise<User | undefined> {
        const [rows] = await db.execute<UserRow[]>(
            `SELECT ${USER_COLUMNS} FROM users WHERE id_user = ?`,
            [id],
        );
        return rows[0] ? toUser(rows[0]) : undefined;
    }

    /** Finds the private account row needed to check a login password. */
    async findByLogin(login: string): Promise<UserRow | undefined> {
        const [rows] = await db.execute<UserRow[]>(
            `SELECT ${USER_COLUMNS}, password_hash
             FROM users
             WHERE email = ? OR user_name = ?
             LIMIT 1`,
            [login, login],
        );
        return rows[0];
    }

    async findByEmail(email: string): Promise<User | undefined> {
        const [rows] = await db.execute<UserRow[]>(
            `SELECT ${USER_COLUMNS} FROM users WHERE email = ?`,
            [email],
        );
        return rows[0] ? toUser(rows[0]) : undefined;
    }

    async findByUsername(username: string): Promise<User | undefined> {
        const [rows] = await db.execute<UserRow[]>(
            `SELECT ${USER_COLUMNS} FROM users WHERE user_name = ?`,
            [username],
        );
        return rows[0] ? toUser(rows[0]) : undefined;
    }

    /** Creates an account and returns it without its password hash. */
    async create(input: {
        user_name: string;
        first_name: string;
        last_name: string;
        email: string;
        password_hash: string;
        role: UserRole;
    }): Promise<User> {
        const [result] = await db.execute<ResultSetHeader>(
            `INSERT INTO users
                (user_name, first_name, last_name, email, password_hash, role)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                input.user_name,
                input.first_name,
                input.last_name,
                input.email,
                input.password_hash,
                input.role,
            ],
        );

        const user = await this.findById(result.insertId);
        if (!user) throw new Error("Created user could not be loaded");
        return user;
    }

    /** Updates only the editable fields supplied by the account owner. */
    async updateProfile(
        id: number,
        input: Partial<Pick<User, "user_name" | "first_name" | "last_name" | "email">>,
    ): Promise<User | undefined> {
        const editableFields = ["user_name", "first_name", "last_name", "email"] as const;
        const changedFields = editableFields.filter((field) => input[field] !== undefined);

        if (changedFields.length > 0) {
            const assignments = changedFields.map((field) => `${field} = ?`).join(", ");
            const values = changedFields.map((field) => input[field] as string);
            await db.execute(
                `UPDATE users SET ${assignments} WHERE id_user = ?`,
                [...values, id],
            );
        }

        return this.findById(id);
    }

    /** Enables or disables an account. */
    async setActive(id: number, active: boolean): Promise<User | undefined> {
        await db.execute("UPDATE users SET active = ? WHERE id_user = ?", [active, id]);
        return this.findById(id);
    }

    /** Stores a hash of the bearer token rather than the token itself. */
    async saveSession(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
        await db.execute(
            "INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
            [userId, tokenHash, expiresAt],
        );
    }

    /** Returns the account for a valid, unexpired session. */
    async findSession(tokenHash: string): Promise<User | undefined> {
        const qualifiedColumns = USER_COLUMNS
            .split(", ")
            .map((column) => `u.${column}`)
            .join(", ");
        const [rows] = await db.execute<UserRow[]>(
            `SELECT ${qualifiedColumns}
             FROM user_sessions AS s
             JOIN users AS u ON u.id_user = s.user_id
             WHERE s.token_hash = ?
               AND s.expires_at > CURRENT_TIMESTAMP
               AND u.active = TRUE`,
            [tokenHash],
        );
        return rows[0] ? toUser(rows[0]) : undefined;
    }

    /** Removes a session, which makes its bearer token unusable. */
    async deleteSession(tokenHash: string): Promise<void> {
        await db.execute("DELETE FROM user_sessions WHERE token_hash = ?", [tokenHash]);
    }
}
