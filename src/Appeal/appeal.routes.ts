import { Router } from "express";
import { findAll } from "./appeal.controller.js";

const apelacionRouter = Router()

apelacionRouter.get('/',findAll)