import { Router } from "express";
import { authenticate, requireRole } from "../user.auth.js";
import { validateRegistration } from "../user.validation.js";
import {
    createAdministrator,
    listAdministrators,
    listPendingAppeals,
    listUsers,
    reviewAppeal,
    setAdministratorActive,
    setUserActive,
} from "./administrator.controller.js";

export const administratorRouter = Router();

// Every administrator endpoint requires a valid administrator session.
administratorRouter.use(authenticate, requireRole("administrator"));
administratorRouter.get("/", listAdministrators);
administratorRouter.post("/", validateRegistration, createAdministrator);
administratorRouter.get("/appeals", listPendingAppeals);
administratorRouter.patch("/appeals/:id", reviewAppeal);
administratorRouter.patch("/:id/active", setAdministratorActive);
administratorRouter.get("/users", listUsers);
administratorRouter.patch("/users/:id/active", setUserActive);
