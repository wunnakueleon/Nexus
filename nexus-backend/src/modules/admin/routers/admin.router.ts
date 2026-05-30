import { Router } from "express";
import { getApprovalHistoryList, getApprovalQueue, resolveApproval } from "../controllers/approval.controller";
import { getAccessCodes, generateCodes, expireCode } from "../controllers/code.controller";
import {
	getPendingWorldRequests,
	getWorldRequestHistory,
	listWorlds,
	resolveWorldRequestById,
	submitWorldRequest,
	updateWorldDetails,
} from "../controllers/world.controller";

const adminRouter = Router();

adminRouter.get("/approvals", getApprovalQueue);
adminRouter.patch("/approvals/:id", resolveApproval);
adminRouter.get("/approvals/history", getApprovalHistoryList);
adminRouter.get("/worlds", listWorlds);
adminRouter.patch("/worlds/:id", updateWorldDetails);
adminRouter.get("/world-requests/pending", getPendingWorldRequests);
adminRouter.get("/world-requests/history", getWorldRequestHistory);
adminRouter.post("/world-requests", submitWorldRequest);
adminRouter.patch("/world-requests/:id", resolveWorldRequestById);
adminRouter.get("/codes", getAccessCodes);
adminRouter.post("/codes/generate", generateCodes);
adminRouter.patch("/codes/:id/expire", expireCode);

export default adminRouter;
