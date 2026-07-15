import { Router } from "express";
import { findAll } from "./review.controller.js";

const reseñaRouter = Router()

reseñaRouter.get('/',findAll)