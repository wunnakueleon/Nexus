// =============================================================================
// NEXUS — Seed Script
// Run with: npm run seed
// =============================================================================
// Creates:
//   - 4 initial worlds
//   - 1 admin account (username: admin, password: admin123)
//   - 1 admin access code (pre-used)
//   - 12 government access codes (3 per world, available for sign-up)
//   - 20 resource stock rows (5 resources × 4 worlds)
// =============================================================================

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import "dotenv/config";
import bcrypt from "bcrypt";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌍 NEXUS Seed — Starting...\n");

  // ─────────────────────────────────────────────
  // CLEANUP (reverse dependency order)
  // ─────────────────────────────────────────────

  console.log("Cleaning existing data...");

  await prisma.shipmentFlag.deleteMany();
  await prisma.shipmentTimeline.deleteMany();
  await prisma.shipmentItem.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.tradeOffer.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.tradeRequest.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.worldRequest.deleteMany();
  await prisma.user.deleteMany();
  await prisma.accessCode.deleteMany();
  await prisma.world.deleteMany();

  console.log("✓ Database cleared.\n");

  // ─────────────────────────────────────────────
  // WORLDS
  // ─────────────────────────────────────────────

  console.log("Creating worlds...");

  const gloriaVenus = await prisma.world.create({
    data: { name: "GloriaVenus", colorHex: "#C47A1A", status: "active" },
  });

  const nanPtune = await prisma.world.create({
    data: { name: "NanPtune", colorHex: "#3A8C8C", status: "active" },
  });

  const minUranus = await prisma.world.create({
    data: { name: "MinUranus", colorHex: "#4A6FA5", status: "active" },
  });

  const wunnaMars = await prisma.world.create({
    data: { name: "WunnaMars", colorHex: "#A04030", status: "active" },
  });

  console.log("✓ Created 4 worlds: GloriaVenus, NanPtune, MinUranus, WunnaMars\n");

  // ─────────────────────────────────────────────
  // ADMIN ACCOUNT
  // ─────────────────────────────────────────────
  // Admin has no real world affiliation; worldId is required by schema so
  // we assign GloriaVenus as a technical placeholder. The admin role
  // overrides world affiliation — the UI never shows a world badge for admin.
  // ─────────────────────────────────────────────

  console.log("Creating admin account...");

  const adminCode = await prisma.accessCode.create({
    data: {
      codeString: "NEXUS-ADM-0001",
      worldId: gloriaVenus.id,
      role: "admin",
      status: "used",
      usedAt: new Date(),
    },
  });

  const hashedPassword = await bcrypt.hash("admin123", 10);

  const adminUser = await prisma.user.create({
    data: {
      name: "NEXUS Admin",
      username: "admin",
      passwordHash: hashedPassword,
      worldId: gloriaVenus.id,
      role: "admin",
      status: "active",
      codeId: adminCode.id,
      approvedAt: new Date(),
    },
  });

  await prisma.accessCode.update({
    where: { id: adminCode.id },
    data: { usedByUserId: adminUser.id },
  });

  console.log("✓ Admin account created (username: admin, password: admin123)\n");

  // ─────────────────────────────────────────────
  // ACCESS CODES
  // ─────────────────────────────────────────────
  // 12 codes: 1 resource_manager + 1 transit_officer + 1 commercial_citizen
  // per world. All status: available.
  // ─────────────────────────────────────────────

  console.log("Generating access codes...");

  const codes: Array<{
    codeString: string;
    worldId: number;
    worldName: string;
    role: "resource_manager" | "transit_officer" | "commercial_citizen";
  }> = [
    // GloriaVenus
    { codeString: "GLV-RSM-7742", worldId: gloriaVenus.id, worldName: "GloriaVenus", role: "resource_manager" },
    { codeString: "GLV-TRO-3318", worldId: gloriaVenus.id, worldName: "GloriaVenus", role: "transit_officer" },
    { codeString: "GLV-CCZ-9901", worldId: gloriaVenus.id, worldName: "GloriaVenus", role: "commercial_citizen" },
    // NanPtune
    { codeString: "NPT-RSM-4401", worldId: nanPtune.id, worldName: "NanPtune", role: "resource_manager" },
    { codeString: "NPT-TRO-8823", worldId: nanPtune.id, worldName: "NanPtune", role: "transit_officer" },
    { codeString: "NPT-CCZ-2067", worldId: nanPtune.id, worldName: "NanPtune", role: "commercial_citizen" },
    // MinUranus
    { codeString: "MNU-RSM-5567", worldId: minUranus.id, worldName: "MinUranus", role: "resource_manager" },
    { codeString: "MNU-TRO-1194", worldId: minUranus.id, worldName: "MinUranus", role: "transit_officer" },
    { codeString: "MNU-CCZ-6638", worldId: minUranus.id, worldName: "MinUranus", role: "commercial_citizen" },
    // WunnaMars
    { codeString: "WNM-RSM-3352", worldId: wunnaMars.id, worldName: "WunnaMars", role: "resource_manager" },
    { codeString: "WNM-TRO-7719", worldId: wunnaMars.id, worldName: "WunnaMars", role: "transit_officer" },
    { codeString: "WNM-CCZ-4483", worldId: wunnaMars.id, worldName: "WunnaMars", role: "commercial_citizen" },
  ];

  for (const code of codes) {
    await prisma.accessCode.create({
      data: {
        codeString: code.codeString,
        worldId: code.worldId,
        role: code.role,
        status: "available",
      },
    });
  }

  console.log("✓ Generated 12 access codes (3 per world)\n");

  // ─────────────────────────────────────────────
  // Print codes for easy reference during demo
  // ─────────────────────────────────────────────

  console.log("┌──────────────────────────────────────────────────────────┐");
  console.log("│                    ACCESS CODES                          │");
  console.log("├──────────────┬──────────────────┬────────────────────────┤");
  console.log("│ Code         │ World            │ Role                   │");
  console.log("├──────────────┼──────────────────┼────────────────────────┤");
  for (const code of codes) {
    const paddedCode = code.codeString.padEnd(12);
    const paddedWorld = code.worldName.padEnd(16);
    const paddedRole = code.role.padEnd(22);
    console.log(`│ ${paddedCode} │ ${paddedWorld} │ ${paddedRole} │`);
  }
  console.log("└──────────────┴──────────────────┴────────────────────────┘\n");

  // ─────────────────────────────────────────────
  // RESOURCE STOCKS
  // ─────────────────────────────────────────────
  // 5 resources × 4 worlds = 20 rows.
  // ─────────────────────────────────────────────

  console.log("Seeding resource stocks...");

  type ResourceRow = {
    worldId: number;
    resourceType: "fuel" | "water" | "food" | "medicine" | "steel";
    stock: number;
    status: "surplus" | "stable" | "low" | "critical";
    burnRate: number;
  };

  const resourceData: ResourceRow[] = [
    // GloriaVenus — industrial: surplus fuel, critical food and steel
    { worldId: gloriaVenus.id, resourceType: "fuel",     stock: 12400, status: "surplus",  burnRate: 80 },
    { worldId: gloriaVenus.id, resourceType: "water",    stock:  3200, status: "stable",   burnRate: 45 },
    { worldId: gloriaVenus.id, resourceType: "food",     stock:   800, status: "critical", burnRate: 60 },
    { worldId: gloriaVenus.id, resourceType: "medicine", stock:  5100, status: "stable",   burnRate: 20 },
    { worldId: gloriaVenus.id, resourceType: "steel",    stock:   200, status: "critical", burnRate: 15 },

    // NanPtune — agricultural: surplus water/food/steel, low fuel
    { worldId: nanPtune.id,    resourceType: "fuel",     stock:  2100, status: "low",      burnRate: 55 },
    { worldId: nanPtune.id,    resourceType: "water",    stock: 14000, status: "surplus",  burnRate: 90 },
    { worldId: nanPtune.id,    resourceType: "food",     stock:  9200, status: "surplus",  burnRate: 70 },
    { worldId: nanPtune.id,    resourceType: "medicine", stock:  3300, status: "stable",   burnRate: 25 },
    { worldId: nanPtune.id,    resourceType: "steel",    stock:  7600, status: "surplus",  burnRate: 50 },

    // MinUranus — scientific: surplus medicine, everything else stable
    { worldId: minUranus.id,   resourceType: "fuel",     stock:  5500, status: "stable",   burnRate: 60 },
    { worldId: minUranus.id,   resourceType: "water",    stock:  4800, status: "stable",   burnRate: 50 },
    { worldId: minUranus.id,   resourceType: "food",     stock:  3100, status: "stable",   burnRate: 40 },
    { worldId: minUranus.id,   resourceType: "medicine", stock: 11000, status: "surplus",  burnRate: 30 },
    { worldId: minUranus.id,   resourceType: "steel",    stock:  4200, status: "stable",   burnRate: 25 },

    // WunnaMars — energy hub: surplus fuel, low on water/food/medicine
    { worldId: wunnaMars.id,   resourceType: "fuel",     stock: 15000, status: "surplus",  burnRate: 100 },
    { worldId: wunnaMars.id,   resourceType: "water",    stock:  1800, status: "low",      burnRate:  40 },
    { worldId: wunnaMars.id,   resourceType: "food",     stock:  2200, status: "low",      burnRate:  50 },
    { worldId: wunnaMars.id,   resourceType: "medicine", stock:  1200, status: "low",      burnRate:  30 },
    { worldId: wunnaMars.id,   resourceType: "steel",    stock:  3800, status: "stable",   burnRate:  20 },
  ];

  for (const resource of resourceData) {
    await prisma.resource.create({ data: resource });
  }

  console.log("✓ Seeded 20 resource rows (5 resources × 4 worlds)\n");

  // ─────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────

  console.log("═══════════════════════════════════════════════════════════");
  console.log("  NEXUS Seed Complete");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("");
  console.log("  Worlds:        4  (GloriaVenus, NanPtune, MinUranus, WunnaMars)");
  console.log("  Admin:         1  (username: admin / password: admin123)");
  console.log("  Access Codes: 12  (3 per world — available for sign-up)");
  console.log("  Resources:    20  (5 types × 4 worlds)");
  console.log("");
  console.log("  Next steps:");
  console.log("    1. Start backend:   npm run dev");
  console.log("    2. Start frontend:  cd ../nexus-frontend && npm run dev");
  console.log("    3. Sign in as admin: admin / admin123");
  console.log("    4. Use access codes above to sign up as other roles");
  console.log("");
  console.log("═══════════════════════════════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
