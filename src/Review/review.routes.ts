import { Router } from "express";
import { findAll } from "./review.controller.js";

const reviewRouter = Router()

reviewRouter.get('/',findAll)
