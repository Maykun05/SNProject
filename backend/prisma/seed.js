import prisma from "../src/config/prisma.js";

const FEATURE_SEED = [
  { id: 1, name: "water" },
  { id: 2, name: "food" },
  { id: 3, name: "mood" },
  { id: 4, name: "sleep" },
  { id: 5, name: "exercise" },
];

/** id ตรงกับ TREE_ASSETS / Profile.selectedTreeType ในแอป */
const TREE_TYPE_SEED = [
  { id: 1, key: "type1", displayName: "ต้นชุด 1", unlockCoinCost: 0, sortOrder: 1 },
  { id: 2, key: "type2", displayName: "ต้นชุด 2", unlockCoinCost: 200, sortOrder: 2 },
  { id: 3, key: "type3", displayName: "ต้นชุด 3", unlockCoinCost: 350, sortOrder: 3 },
  { id: 4, key: "type4", displayName: "ต้นชุด 4", unlockCoinCost: 500, sortOrder: 4 },
  { id: 5, key: "type5", displayName: "ต้นชุด 5", unlockCoinCost: 700, sortOrder: 5 },
];

async function main() {
  for (const feature of FEATURE_SEED) {
    await prisma.feature.upsert({
      where: { id: feature.id },
      update: { name: feature.name },
      create: feature,
    });
  }

  for (const t of TREE_TYPE_SEED) {
    await prisma.treeType.upsert({
      where: { id: t.id },
      update: {
        key: t.key,
        displayName: t.displayName,
        unlockCoinCost: t.unlockCoinCost,
        sortOrder: t.sortOrder,
      },
      create: t,
    });
  }

  console.log("Seeded Feature model:", FEATURE_SEED);
  console.log("Seeded TreeType model:", TREE_TYPE_SEED);
}

main()
  .catch((err) => {
    console.error("Feature seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
