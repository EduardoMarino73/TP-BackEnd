import { Router } from "express";
import { findAll } from "./appeal.controller.js";

const appealRouter = Router()

appealRouter.get('/',findAll)
