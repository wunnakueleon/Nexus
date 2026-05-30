import { Router } from "express";
import { getApprovalQueue, resolveApproval } from "../controllers/approval.controller";

const adminRouter = Router();

adminRouter.get("/approvals", getApprovalQueue);
adminRouter.patch("/approvals/:id", resolveApproval);

export default adminRouter;
