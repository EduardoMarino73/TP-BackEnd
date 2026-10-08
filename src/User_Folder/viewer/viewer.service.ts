import { Viewer } from "./viewer.entity.js";
import { ViewerRepository } from "./viewer.repository.js";

/** Applies viewer-specific lookup rules before reading profile data. */
export class ViewerService {
    constructor(private readonly repository = new ViewerRepository()) {}

    /** Returns the viewer profile when the ID is valid and has viewer role. */
    findProfile(id: number): Promise<Viewer | undefined> {
        if (!Number.isSafeInteger(id) || id < 1) return Promise.resolve(undefined);
        return this.repository.findOne(id);
    }
}
