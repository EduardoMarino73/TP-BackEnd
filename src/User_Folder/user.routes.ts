import { Router } from "express";
import { authenticate } from "./user.auth.js";
import { login, logout, me, register, updateMe } from "./user.controller.js";
import { validateLogin, validateProfile, validateRegistration } from "./user.validation.js";

export const userRouter = Router();

// Authentication and self-service routes shared by all account roles.
userRouter.post("/register", validateRegistration, register);
userRouter.post("/login", validateLogin, login);
userRouter.post("/logout", authenticate, logout);
userRouter.get("/me", authenticate, me);
userRouter.patch("/me", authenticate, validateProfile, updateMe);
