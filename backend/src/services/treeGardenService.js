import prisma from "../config/prisma.js";

export const HOME_GARDEN_SLOT_COUNT = 9;

/** ปลดล็อกแล้วถ้าฟรี หรือมีแถว UserTreeUnlock */
export async function isTreeTypeUnlocked(userId, treeType) {
  if (!treeType) return false;
  if (treeType.unlockCoinCost <= 0) return true;
  const row = await prisma.userTreeUnlock.findUnique({
    where: { userId_treeTypeId: { userId, treeTypeId: treeType.id } },
  });
  return Boolean(row);
}

/** สร้างช่องสวนหน้าโฮมถ้ายังไม่ครบ */
export async function ensureHomeGardenSlots(userId) {
  const existing = await prisma.homeGardenSlot.findMany({
    where: { userId },
    select: { slotIndex: true },
  });
  const have = new Set(existing.map((s) => s.slotIndex));
  const creates = [];
  for (let i = 0; i < HOME_GARDEN_SLOT_COUNT; i++) {
    if (!have.has(i)) {
      creates.push(prisma.homeGardenSlot.create({ data: { userId, slotIndex: i } }));
    }
  }
  if (creates.length) await prisma.$transaction(creates);
}

/**
 * เลือกชนิดต้นที่ได้จากรางวัลรายวัน: ใช้ selectedTreeType ใน Profile ถ้าปลดล็อกแล้ว ไม่งั้นใช้ชนิดฟรีตัวแรก
 */
export async function resolveTreeTypeIdForDailyReward(userId) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  const preferredId = profile?.selectedTreeType ?? 1;
  const preferred = await prisma.treeType.findUnique({ where: { id: preferredId } });
  if (preferred && (await isTreeTypeUnlocked(userId, preferred))) {
    return preferred.id;
  }
  const free = await prisma.treeType.findFirst({
    where: { unlockCoinCost: 0 },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  if (free) return free.id;

  const anyUnlocked = await prisma.treeType.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  for (const t of anyUnlocked) {
    if (await isTreeTypeUnlocked(userId, t)) return t.id;
  }
  return preferredId;
}

/**
 * ครบกิจกรรมวันนั้น → ได้ต้น 1 ต้น (ไม่ซ้ำต่อวัน)
 * @returns {Promise<{ created: boolean, earnedTree?: object }>}
 */
export async function grantDailyTreeIfNeeded(userId, dayStart) {
  const existing = await prisma.earnedTree.findUnique({
    where: {
      userId_refDate_source: {
        userId,
        refDate: dayStart,
        source: "DAILY_COMPLETE",
      },
    },
  });
  if (existing) {
    return { created: false, earnedTree: existing };
  }

  const treeTypeId = await resolveTreeTypeIdForDailyReward(userId);
  const type = await prisma.treeType.findUnique({ where: { id: treeTypeId } });
  if (!type) {
    return { created: false };
  }
  if (!(await isTreeTypeUnlocked(userId, type))) {
    return { created: false };
  }

  const earnedTree = await prisma.earnedTree.create({
    data: {
      userId,
      treeTypeId,
      source: "DAILY_COMPLETE",
      refDate: dayStart,
    },
    include: { treeType: true },
  });
  return { created: true, earnedTree };
}
