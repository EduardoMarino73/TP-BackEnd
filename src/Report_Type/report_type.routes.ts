import { Router } from "express";
import { findAll } from "./report_type.controller.js";

const reportTypeRouter = Router()

reportTypeRouter.get('/',findAll)
