/** สูตรเดียวกับ MyApp LevelContext (xp สะสมไปเลเวลถัดไป) */

export function xpForLevel(level) {
  return Math.floor(100 * Math.pow(1.3, level - 1));
}

export function applyXpDelta(currentXp, currentLevel, totalXp, amount) {
  const add = Math.floor(Number(amount)) || 0;
  if (add <= 0) {
    return {
      xp: Math.max(0, Math.floor(currentXp) || 0),
      level: Math.max(1, Math.floor(currentLevel) || 1),
      totalXp: Math.max(0, Math.floor(totalXp) || 0),
    };
  }

  let newXp = (Math.floor(currentXp) || 0) + add;
  let newLevel = Math.max(1, Math.floor(currentLevel) || 1);
  let newTotal = (Math.floor(totalXp) || 0) + add;

  while (newXp >= xpForLevel(newLevel)) {
    newXp -= xpForLevel(newLevel);
    newLevel += 1;
  }

  return { xp: newXp, level: newLevel, totalXp: newTotal };
}

/**
 * อัปเดต XP ใน transaction (อ่าน user ล่าสุดแล้วคำนวณใหม่)
 */
export async function applyXpInTransaction(tx, userId, amount) {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true, totalXp: true },
  });
  if (!user) throw new Error("USER_NOT_FOUND");

  const next = applyXpDelta(user.xp, user.level, user.totalXp, amount);
  await tx.user.update({
    where: { id: userId },
    data: {
      xp: next.xp,
      level: next.level,
      totalXp: next.totalXp,
    },
  });
  return next;
}
