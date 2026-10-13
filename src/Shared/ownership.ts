import { Response } from "express";

/**
 * Result of a write on data that only its owner may change.
 * Services return it; controllers turn it into 200, 404 or 403.
 */
export type OwnedResult<T> =
    | { data: T }
    | { error: "not_found" | "forbidden" };

/**
 * Checks that the content exists and belongs to the user before running the write.
 * By default the owner is the content's id_author (the uploader).
 */
export async function whenOwner<C, T>(
    content: C | undefined,
    userId: number,
    write: (content: C) => Promise<T | undefined>,
    ownerOf: (content: C) => number = (found) => (found as { id_author: number }).id_author,
): Promise<OwnedResult<T>> {
    if (!content) return { error: "not_found" };
    if (Number(ownerOf(content)) !== userId) return { error: "forbidden" };
    const data = await write(content);
    return data === undefined ? { error: "not_found" } : { data };
}

/** Sends the error of an OwnedResult. Returns true when it was an error. */
export function sendOwnershipError<T>(
    res: Response,
    result: OwnedResult<T>,
    notFoundMessage: string,
    forbiddenMessage = "Only the user who uploaded this content can change it",
): result is { error: "not_found" | "forbidden" } {
    if (!("error" in result)) return false;
    if (result.error === "forbidden") {
        res.status(403).json({ message: forbiddenMessage });
    } else {
        res.status(404).json({ message: notFoundMessage });
    }
    return true;
}
