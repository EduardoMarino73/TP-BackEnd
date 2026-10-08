import { NextFunction, Request, Response } from "express";
import { hashPassword } from "../user.auth.js";
import { UserRepository } from "../user.repository.js";
import { AdministratorService } from "./administrator.service.js";

const administrators = new AdministratorService();
const users = new UserRepository();

/** Sends rejected asynchronous controller work to Express error handling. */
function asyncHandler(
    action: (req: Request, res: Response) => Promise<unknown>,
) {
    return (req: Request, res: Response, next: NextFunction): void => {
        void action(req, res).catch(next);
    };
}

/** Lists administrator accounts. */
export const listAdministrators = asyncHandler(async (_req, res) => {
    return res.json({ data: await administrators.list() });
});

/** Lists all accounts so administrators can manage viewers and admins. */
export const listUsers = asyncHandler(async (_req, res) => {
    return res.json({ data: await administrators.listUsers() });
});

/** Lists the appeals waiting for administrator moderation. */
export const listPendingAppeals = asyncHandler(async (_req, res) => {
    return res.json({ data: await administrators.listPendingAppeals() });
});

/** Creates an administrator after checking account uniqueness. */
export const createAdministrator = asyncHandler(async (req, res) => {
    const { email, user_name: username, password } = req.body;
    const existingEmail = await users.findByEmail(email);
    const existingUsername = await users.findByUsername(username);

    if (existingEmail || existingUsername) {
        return res.status(409).json({ message: "Email or username is already in use" });
    }

    const administrator = await administrators.create({
        ...req.body,
        password_hash: await hashPassword(password),
    });
    return res.status(201).json({ data: administrator });
});

/** Enables or disables an administrator account. */
export const setAdministratorActive = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
        return res.status(400).json({ message: "Invalid administrator id" });
    }
    if (id === req.user?.id_user && req.body.active === false) {
        return res.status(400).json({ message: "You cannot deactivate your own account" });
    }
    if (typeof req.body.active !== "boolean") {
        return res.status(400).json({ message: "active must be a boolean" });
    }

    const administrator = await administrators.setActive(id, req.body.active);
    if (!administrator) {
        return res.status(404).json({ message: "Administrator not found" });
    }
    return res.json({ data: administrator });
});

/** Enables or disables a viewer or administrator account. */
export const setUserActive = asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) {
        return res.status(400).json({ message: "Invalid user id" });
    }
    if (id === req.user?.id_user && req.body.active === false) {
        return res.status(400).json({ message: "You cannot deactivate your own account" });
    }
    if (typeof req.body.active !== "boolean") {
        return res.status(400).json({ message: "active must be a boolean" });
    }

    const user = await administrators.setUserActive(id, req.body.active);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ data: user });
});

/** Accepts or rejects an appeal and suspends upheld content when required. */
export const reviewAppeal = asyncHandler(async (req, res) => {
    const appealId = Number(req.params.id);
    const decision = req.body?.decision;

    if (!Number.isSafeInteger(appealId) || appealId < 1) {
        return res.status(400).json({ message: "Invalid appeal id" });
    }
    if (decision !== "approved" && decision !== "rejected") {
        return res.status(400).json({
            message: "decision must be approved or rejected",
        });
    }

    const result = await administrators.resolveAppeal(
        appealId,
        req.user!.id_user,
        decision,
    );
    if (!result) return res.status(404).json({ message: "Pending appeal not found" });

    return res.json({
        data: result.appeal,
        upheldReportCount: result.reportCount,
        contentSuspended: result.suspended,
    });
});
