import { prisma } from "../../../db";
import type { PlatformOverview, WorldOperatorCount } from "../types/admin.types";

export const getPlatformOverview = async (): Promise<PlatformOverview> => {
	const [
		activeOperators,
		pendingApprovals,
		availableCodes,
		usedCodes,
		activeTradeRequests,
		activeShipments,
		activeListings,
		worlds,
	] = await Promise.all([
		// Active operators (non-admin users with active status)
		prisma.user.count({
			where: {
				role: { in: ["resource_manager", "transit_officer", "commercial_citizen"] },
				status: "active",
			},
		}),

		// Pending approvals (users in pending state waiting for access review)
		prisma.user.count({
			where: { status: "pending" },
		}),

		// Access codes that haven't been used yet
		prisma.accessCode.count({
			where: { status: "available" },
		}),

		// Access codes that have been claimed
		prisma.accessCode.count({
			where: { status: "used" },
		}),

		// Trade requests still in flight (pending or accepted, not yet fulfilled)
		prisma.tradeRequest.count({
			where: { status: { in: ["pending", "accepted"] } },
		}),

		// Shipments that haven't reached delivered/cancelled
		prisma.shipment.count({
			where: { status: { notIn: ["delivered", "cancelled"] } },
		}),

		// Marketplace listings that are still open for offers
		prisma.listing.count({
			where: { status: { in: ["available", "in_pending_trade"] } },
		}),

		// All active worlds with their active operator counts
		prisma.world.findMany({
			where: { status: "active" },
			select: {
				id: true,
				name: true,
				colorHex: true,
				users: {
					where: {
						role: { in: ["resource_manager", "transit_officer", "commercial_citizen"] },
						status: "active",
					},
					select: { id: true },
				},
			},
			orderBy: { name: "asc" },
		}),
	]);

	const operatorsPerWorld: WorldOperatorCount[] = worlds.map(w => ({
		worldId: w.id,
		worldName: w.name,
		colorHex: w.colorHex,
		activeOperators: w.users.length,
	}));

	return {
		activeOperators,
		pendingApprovals,
		availableCodes,
		usedCodes,
		activeTradeRequests,
		activeShipments,
		activeListings,
		operatorsPerWorld,
	};
};