import {
    createHash,
    randomBytes,
    scrypt as scryptCallback,
    timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { NextFunction, Request, Response } from "express";
import { User, UserRole } from "./user.entity.js";
import { UserRepository } from "./user.repository.js";

const scrypt = promisify(scryptCallback);
const users = new UserRepository();

/** Adds the authenticated account and token hash to Express request types. */
declare global {
    namespace Express {
        interface Request {
            user?: User;
            authTokenHash?: string;
        }
    }
}

/** Hashes a password with a random salt before it is stored. */
export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16);
    const key = await scrypt(password, salt, 64) as Buffer;
    return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

/** Checks a password against the stored scrypt hash. */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [algorithm, saltHex, keyHex] = storedHash.split("$");
    if (algorithm !== "scrypt" || !saltHex || !keyHex) return false;

    const expectedKey = Buffer.from(keyHex, "hex");
    const actualKey = await scrypt(
        password,
        Buffer.from(saltHex, "hex"),
        expectedKey.length,
    ) as Buffer;

    return actualKey.length === expectedKey.length
        && timingSafeEqual(actualKey, expectedKey);
}

/** Produces the database-safe SHA-256 representation of a bearer token. */
export function hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
}

/** Loads the active user associated with the request's bearer token. */
export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<unknown> {
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Bearer token required" });
    }

    const token = authorization.slice("Bearer ".length).trim();
    if (!token) return res.status(401).json({ message: "Invalid token" });

    try {
        const tokenHash = hashToken(token);
        const user = await users.findSession(tokenHash);
        if (!user) return res.status(401).json({ message: "Invalid or expired token" });

        req.user = user;
        req.authTokenHash = tokenHash;
        return next();
    } catch (error) {
        return next(error);
    }
}

/** Restricts a route to an authenticated account with the requested role. */
export function requireRole(role: UserRole) {
    return (req: Request, res: Response, next: NextFunction): unknown => {
        if (!req.user) {
            return res.status(401).json({ message: "Authentication required" });
        }
        if (req.user.role !== role) {
            return res.status(403).json({ message: "Insufficient permissions" });
        }
        return next();
    };
}
