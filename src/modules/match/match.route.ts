import { Router } from "express";
import { matchController } from "./match.controller";

export const matchRouter = Router();

matchRouter.get("/", matchController.getMatches);

matchRouter.post("/", matchController.addMatch);
