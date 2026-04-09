import prisma from "../src/config/prisma.js";

const FEATURE_SEED = [
  { id: 1, name: "water" },
  { id: 2, name: "food" },
  { id: 3, name: "mood" },
  { id: 4, name: "sleep" },
  { id: 5, name: "exercise" },
];

async function main() {
  for (const feature of FEATURE_SEED) {
    await prisma.feature.upsert({
      where: { id: feature.id },
      update: { name: feature.name },
      create: feature,
    });
  }

  console.log("Seeded Feature model:", FEATURE_SEED);
}

main()
  .catch((err) => {
    console.error("Feature seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
