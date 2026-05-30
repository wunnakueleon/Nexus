import { Router } from "express";
import { getAuthStatus, signIn, signUp } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/signup", signUp);
authRouter.post("/signin", signIn);
authRouter.get("/status", getAuthStatus);

export default authRouter;
