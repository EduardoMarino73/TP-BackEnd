import { Response } from "express";

/**
 * Result of a write on content that only its uploader may change.
 * Services return it; controllers turn it into 200, 404 or 403.
 */
export type OwnedResult<T> =
    | { data: T }
    | { error: "not_found" | "forbidden" };

/** Checks that the content exists and belongs to the user before running the write. */
export async function whenOwner<C extends { id_author: number }, T>(
    content: C | undefined,
    userId: number,
    write: (content: C) => Promise<T | undefined>,
): Promise<OwnedResult<T>> {
    if (!content) return { error: "not_found" };
    if (Number(content.id_author) !== userId) return { error: "forbidden" };
    const data = await write(content);
    return data === undefined ? { error: "not_found" } : { data };
}

/** Sends the error of an OwnedResult. Returns true when it was an error. */
export function sendOwnershipError<T>(
    res: Response,
    result: OwnedResult<T>,
    notFoundMessage: string,
): result is { error: "not_found" | "forbidden" } {
    if (!("error" in result)) return false;
    if (result.error === "forbidden") {
        res.status(403).json({ message: "Only the user who uploaded this content can change it" });
    } else {
        res.status(404).json({ message: notFoundMessage });
    }
    return true;
}
