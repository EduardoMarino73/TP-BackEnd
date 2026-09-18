import { Router } from "express";
import { findAll } from "./complaint.controller.js";

const complaintRouter = Router()

complaintRouter.get('/',findAll)
