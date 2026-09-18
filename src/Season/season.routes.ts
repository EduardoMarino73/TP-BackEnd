import { Router } from "express";
import { findAll } from "./season.controller.js";

export const seasonRouter = Router()

seasonRouter.get('/',findAll)
