import { Router } from "express";
import { getApprovalQueue, resolveApproval } from "../controllers/approval.controller";
import { getAccessCodes, generateCodes, expireCode } from "../controllers/code.controller";
import { listWorlds } from "../controllers/world.controller";

const adminRouter = Router();

adminRouter.get("/approvals", getApprovalQueue);
adminRouter.patch("/approvals/:id", resolveApproval);
adminRouter.get("/worlds", listWorlds);
adminRouter.get("/codes", getAccessCodes);
adminRouter.post("/codes/generate", generateCodes);
adminRouter.patch("/codes/:id/expire", expireCode);

export default adminRouter;
