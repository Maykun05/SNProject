import prisma from "../config/prisma.js";

/** ปลดล็อกแล้วถ้าฟรี หรือมีแถว UserTreeUnlock */
export async function isTreeTypeUnlocked(userId, treeType) {
  if (!treeType) return false;
  if (treeType.unlockCoinCost <= 0) return true;
  const row = await prisma.userTreeUnlock.findUnique({
    where: { userId_treeTypeId: { userId, treeTypeId: treeType.id } },
  });
  return Boolean(row);
}
