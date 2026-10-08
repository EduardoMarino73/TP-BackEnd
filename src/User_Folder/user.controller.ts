import { randomBytes } from "node:crypto";
import { NextFunction, Request, Response } from "express";
import { hashPassword, hashToken, verifyPassword } from "./user.auth.js";
import { UserRepository } from "./user.repository.js";

const users = new UserRepository();
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const SESSION_DURATION_SECONDS = SESSION_DURATION_MS / 1000;

/** Forwards rejected asynchronous controller work to Express error handling. */
function asyncHandler(
    action: (req: Request, res: Response) => Promise<unknown>,
) {
    return (req: Request, res: Response, next: NextFunction): void => {
        void action(req, res).catch(next);
    };
}

/** Public sign-up always creates a viewer account. */
export const register = asyncHandler(async (req, res) => {
    const { email, user_name: username, password } = req.body;
    const emailInUse = await users.findByEmail(email);
    const usernameInUse = await users.findByUsername(username);

    if (emailInUse || usernameInUse) {
        return res.status(409).json({ message: "Email or username is already in use" });
    }

    const user = await users.create({
        ...req.body,
        password_hash: await hashPassword(password),
        role: "viewer",
    });
    return res.status(201).json({ data: user });
});

/** Checks credentials and creates a seven-day bearer-token session. */
export const login = asyncHandler(async (req, res) => {
    const account = await users.findByLogin(req.body.login);
    const validPassword = account?.password_hash
        ? await verifyPassword(req.body.password, account.password_hash)
        : false;

    if (!account || !validPassword || !account.active) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = randomBytes(32).toString("base64url");
    await users.saveSession(
        account.id_user,
        hashToken(token),
        new Date(Date.now() + SESSION_DURATION_MS),
    );

    const user = await users.findById(account.id_user);
    return res.json({
        token,
        token_type: "Bearer",
        expires_in: SESSION_DURATION_SECONDS,
        user,
    });
});

/** Invalidates the bearer token used for this request. */
export const logout = asyncHandler(async (req, res) => {
    if (req.authTokenHash) await users.deleteSession(req.authTokenHash);
    return res.status(204).end();
});

/** Returns the authenticated account. */
export function me(req: Request, res: Response) {
    return res.json({ data: req.user });
}

/** Updates the authenticated account's editable profile fields. */
export const updateMe = asyncHandler(async (req, res) => {
    const input = req.body;
    const currentUser = req.user!;

    if (input.email && input.email !== currentUser.email) {
        const existingEmail = await users.findByEmail(input.email);
        if (existingEmail) return res.status(409).json({ message: "Email is already in use" });
    }

    if (input.user_name && input.user_name !== currentUser.user_name) {
        const existingUsername = await users.findByUsername(input.user_name);
        if (existingUsername) return res.status(409).json({ message: "Username is already in use" });
    }

    const user = await users.updateProfile(currentUser.id_user, input);
    return res.json({ data: user });
});
