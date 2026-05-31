// =============================================================================
// NEXUS — Commercial Marketplace Seed
// Owned by: Wunna Moe San (681305008535)
// Run with: npm run seed:commercial
// =============================================================================
// Creates:
//   - 4 commercial_citizen users (one per world, using pre-generated codes)
//   - 8 marketplace listings spread across those users
//
// Run AFTER npm run seed (base seed must exist first).
// Safe to re-run — clears commercial data before re-inserting.
// =============================================================================

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import "dotenv/config";
import bcrypt from "bcrypt";

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🛒 Commercial Marketplace Seed — Starting...\n");

  // ─────────────────────────────────────────────
  // CLEANUP commercial data only
  // ─────────────────────────────────────────────

  await prisma.tradeOffer.deleteMany();
  await prisma.listingImage.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany({ where: { role: "commercial_citizen" } });

  const codesToReset = ["GLV-CCZ-9901", "NPT-CCZ-2067", "MNU-CCZ-6638", "WNM-CCZ-4483"];
  await prisma.accessCode.updateMany({
    where: { codeString: { in: codesToReset } },
    data: { status: "available", usedByUserId: null, usedAt: null },
  });

  console.log("✓ Cleared existing commercial data.\n");

  // ─────────────────────────────────────────────
  // COMMERCIAL CITIZENS
  // ─────────────────────────────────────────────

  const citizenPassword = await bcrypt.hash("citizen123", 10);

  const citizens = [
    { codeString: "GLV-CCZ-9901", name: "R. Halden",  username: "glocommercial" },
    { codeString: "NPT-CCZ-2067", name: "S. Okonkwo", username: "nancommercial" },
    { codeString: "MNU-CCZ-6638", name: "V. Reyes",   username: "mincommercial" },
    { codeString: "WNM-CCZ-4483", name: "T. Brak",    username: "wuncommercial" },
  ];

  const createdCitizens: { id: number }[] = [];

  for (const c of citizens) {
    const code = await prisma.accessCode.findUnique({ where: { codeString: c.codeString } });
    if (!code) { console.warn(`Code ${c.codeString} not found — run npm run seed first.`); continue; }

    const user = await prisma.user.create({
      data: {
        name: c.name, username: c.username,
        passwordHash: citizenPassword,
        worldId: code.worldId,
        role: "commercial_citizen",
        status: "active",
        codeId: code.id,
        approvedAt: new Date(),
      },
    });

    await prisma.accessCode.update({
      where: { id: code.id },
      data: { status: "used", usedByUserId: user.id, usedAt: new Date() },
    });

    createdCitizens.push({ id: user.id });
  }

  console.log(`✓ Created ${createdCitizens.length} commercial citizens\n`);

  // ─────────────────────────────────────────────
  // MARKETPLACE LISTINGS
  // ─────────────────────────────────────────────

  type ListingSeed = {
    userId: number; title: string; description: string;
    category: "tools"|"food"|"crafts"|"tech"|"clothing"|"medicine"|"art"|"materials";
    condition: "new_item"|"used"|"handmade"|"rare";
  };

  const [halden, okonkwo, reyes, brak] = createdCitizens;

  const listings: ListingSeed[] = [
    { userId: halden.id,  title: "Reinforced Work Gloves",            category: "tools",     condition: "used",     description: "Heavy-duty gloves from factory district. Reinforced palms, good condition." },
    { userId: halden.id,  title: "Hand-carved Bone Chess Set",        category: "art",       condition: "handmade", description: "Complete set with board. Carved from reclaimed materials, fully playable." },
    { userId: okonkwo.id, title: "Preserved Grain Rations (10kg)",    category: "food",      condition: "new_item", description: "Vacuum-sealed grain from last harvest. Long shelf life, undamaged seal." },
    { userId: okonkwo.id, title: "Water Purification Tablets (x100)", category: "medicine",  condition: "new_item", description: "Purifies 1L per tablet. Essential supply for off-grid survival." },
    { userId: reyes.id,   title: "Portable Diagnostic Scanner",       category: "tech",      condition: "used",     description: "Medical scanner, works on basic power cell. Screen has minor scratch." },
    { userId: reyes.id,   title: "Antibacterial Wound Dressing (x20)",category: "medicine",  condition: "new_item", description: "Standard military-grade dressings, sealed sterile pack." },
    { userId: brak.id,    title: "Thermal Insulation Panels (set 4)", category: "materials", condition: "handmade", description: "Handcrafted from recycled hull plating. Keeps heat in through long nights." },
    { userId: brak.id,    title: "Solar Micro-Charger",               category: "tech",      condition: "used",     description: "Charges small devices. Foldable panel, minor wear on hinge." },
  ];

  for (const l of listings) {
    await prisma.listing.create({ data: { ...l, status: "available" } });
  }

  console.log(`✓ Created ${listings.length} marketplace listings\n`);
  console.log("  Citizens (all password: citizen123):");
  console.log("    glocommercial / nancommercial / mincommercial / wuncommercial");
  console.log("\n═══════════════════════════════════════════════");
  console.log("  Commercial Marketplace Seed Complete");
  console.log("═══════════════════════════════════════════════\n");
}

main()
  .catch(e => { console.error("Seed failed:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
