import { NextFunction, Request, Response } from "express";

/** Trims a string value and converts non-strings to an empty string. */
function readText(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

/** Validates and normalizes public viewer sign-up and administrator creation. */
export function validateRegistration(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const { user_name, first_name, last_name, email, password } = req.body ?? {};
    const username = readText(user_name);
    const firstName = readText(first_name);
    const lastName = readText(last_name);
    const normalizedEmail = readText(email).toLowerCase();
    const errors: string[] = [];

    if (username.length < 3 || username.length > 50) {
        errors.push("user_name must be 3 to 50 characters");
    }
    if (!firstName || firstName.length > 100) {
        errors.push("first_name is required (max 100 characters)");
    }
    if (!lastName || lastName.length > 100) {
        errors.push("last_name is required (max 100 characters)");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
        || normalizedEmail.length > 254) {
        errors.push("email must be valid");
    }
    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
        errors.push("password must be 8 to 128 characters");
    }

    if (errors.length > 0) {
        return res.status(400).json({ message: "Invalid registration", fields: errors });
    }

    req.body = {
        user_name: username,
        first_name: firstName,
        last_name: lastName,
        email: normalizedEmail,
        password,
    };
    return next();
}

/** Checks the fields required to sign in with email or username. */
export function validateLogin(req: Request, res: Response, next: NextFunction) {
    const login = readText(req.body?.login);
    const { password } = req.body ?? {};

    if (!login || typeof password !== "string") {
        return res.status(400).json({ message: "login and password are required" });
    }

    req.body.login = login;
    return next();
}

/** Allows profile changes only to the fields an account owner may edit. */
export function validateProfile(req: Request, res: Response, next: NextFunction) {
    const input = req.body ?? {};
    const editableFields = ["user_name", "first_name", "last_name", "email"] as const;
    const values: Record<string, string> = {};

    for (const field of editableFields) {
        if (input[field] === undefined) continue;
        if (typeof input[field] !== "string" || !readText(input[field])) {
            return res.status(400).json({ message: `${field} must be a non-empty string` });
        }
        values[field] = readText(input[field]);
    }

    if (Object.keys(values).length === 0) {
        return res.status(400).json({ message: "At least one profile field is required" });
    }
    if (values.user_name
        && (values.user_name.length < 3 || values.user_name.length > 50)) {
        return res.status(400).json({ message: "user_name must be 3 to 50 characters" });
    }
    if (values.email) {
        values.email = values.email.toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)
            || values.email.length > 254) {
            return res.status(400).json({ message: "email must be valid" });
        }
    }

    req.body = values;
    return next();
}
