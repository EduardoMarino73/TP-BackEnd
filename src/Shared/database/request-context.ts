import { NextFunction, Request, Response } from "express";
import { RequestContext } from "@mikro-orm/core";
import { orm } from "./connections.js";

/**
 * Gives the rest of the request its own ORM EntityManager (identity map and unit of work),
 * so the entities loaded by one request are never shared with another.
 * index.ts runs it for every request. Upload routes run it again after multer,
 * because multer calls the next middleware outside the request's context.
 */
export function requestContext(_req: Request, _res: Response, next: NextFunction): void {
    RequestContext.create(orm.em, next);
}
