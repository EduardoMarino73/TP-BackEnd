import { Request, Response } from "express";
import fs from "fs";

/**
 * The fields of a request: the JSON body, or the "data" part of a multipart upload.
 * Returns undefined when "data" is not a valid JSON object.
 */
export function readFields(req: Request): Record<string, unknown> | undefined {
    const body = (req.body ?? {}) as Record<string, unknown>;
    if (typeof body.data !== "string") return body;
    try {
        const parsed: unknown = JSON.parse(body.data);
        return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
            ? parsed as Record<string, unknown>
            : undefined;
    } catch {
        return undefined;
    }
}

/** Rules for one text field. */
export type TextRule = { max: number; optional?: boolean; allowEmpty?: boolean };

/**
 * Keeps only the listed text fields, trimmed and checked against their rules.
 * "create" requires every non-optional field; "update" requires at least one field.
 * Any other field in the request (state, views, id_author, path...) is ignored.
 */
export function pickText(
    fields: Record<string, unknown>,
    rules: Record<string, TextRule>,
    mode: "create" | "update",
): { values: Record<string, string> } | { error: string } {
    const values: Record<string, string> = {};
    for (const [name, rule] of Object.entries(rules)) {
        const value = fields[name];
        if (value === undefined || value === null) {
            if (mode === "create" && !rule.optional) return { error: `${name} is required` };
            continue;
        }
        if (typeof value !== "string") return { error: `${name} must be text` };
        const text = value.trim();
        if (!text && !rule.allowEmpty) return { error: `${name} cannot be empty` };
        if (text.length > rule.max) return { error: `${name} must be at most ${rule.max} characters` };
        values[name] = text;
    }
    if (mode === "update" && Object.keys(values).length === 0) {
        return { error: "Send at least one field to change" };
    }
    return { values };
}

/** A positive integer from a number or a numeric string, or undefined. */
export function readPositiveInt(value: unknown): number | undefined {
    const number = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
    return typeof number === "number" && Number.isSafeInteger(number) && number > 0
        ? number
        : undefined;
}

/** Longest duration accepted for a video: 24 hours, in seconds. */
const MAX_DURATION_SECONDS = 24 * 60 * 60;

/**
 * Optional video duration, rounded to whole seconds. Returns null when it was not sent,
 * and undefined when it was sent but is not a valid duration.
 */
export function readDuration(value: unknown): number | null | undefined {
    if (value === undefined || value === null || value === "") return null;
    const seconds = readPositiveInt(typeof value === "number" ? Math.round(value) : value);
    return seconds !== undefined && seconds <= MAX_DURATION_SECONDS ? seconds : undefined;
}

/** Deletes the files multer saved for a request that is being rejected. */
export function discardUploads(req: Request): void {
    const files = [
        ...(req.file ? [req.file] : []),
        ...(Array.isArray(req.files) ? req.files : Object.values(req.files ?? {}).flat()),
    ];
    files.forEach((file) => fs.rm(file.path, { force: true }, () => undefined));
}

/** Rejects a request with { message }, deleting any file it uploaded. */
export function reject(req: Request, res: Response, status: number, message: string) {
    discardUploads(req);
    return res.status(status).json({ message });
}
