import prisma from "../config/prisma.js";

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Prisma client ต้อง regenerate หลังเพิ่ม model WaterLog — มิฉะนั้น prisma.waterLog จะเป็น undefined */
function waterLog() {
  const d = prisma.waterLog;
  if (!d || typeof d.findMany !== "function") {
    throw new Error(
      "Prisma Client ยังไม่มี WaterLog: หยุดเซิร์ฟเวอร์ Node แล้วรัน `npx prisma generate` ในโฟลเดอร์ backend แล้วสตาร์ทใหม่"
    );
  }
  return d;
}

function exerciseHoursFromActivityLevel(level) {
  const n = Number(level);
  const map = { 1: 0, 2: 0.5, 3: 1, 4: 1.5, 5: 2 };
  return map[n] ?? 0;
}

export function recommendedWaterMlFromProfile(profile) {
  if (!profile) return 2000;
  const w = Number(profile.weight) || 0;
  const hours = exerciseHoursFromActivityLevel(profile.activityLevel);
  return Math.round(w * 33 + hours * 600);
}

export async function getDefaultWaterGoal(userId) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (profile?.waterGoal != null) return profile.waterGoal;
  const rec = recommendedWaterMlFromProfile(profile);
  return rec > 0 ? rec : 2000;
}

export async function getWaterSummaryForDay(userId, day) {
  if (!DAY_RE.test(day)) {
    throw new Error("Invalid day format (expected YYYY-MM-DD)");
  }

  const [profile, logs] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    waterLog().findMany({
      where: { userId, day },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const consumed = logs.reduce((s, l) => s + l.amountMl, 0);
  let waterGoal = profile?.waterGoal;
  if (waterGoal == null) {
    waterGoal = recommendedWaterMlFromProfile(profile);
    if (waterGoal <= 0) waterGoal = 2000;
  }

  return {
    consumed,
    waterGoal,
    logs: logs.map((l) => ({
      id: l.id,
      amountMl: l.amountMl,
      createdAt: l.createdAt.toISOString(),
    })),
  };
}

export async function addWaterLogEntry(userId, amountMl, day) {
  if (!DAY_RE.test(day)) {
    throw new Error("Invalid day format (expected YYYY-MM-DD)");
  }
  const amt = Number(amountMl);
  if (!Number.isFinite(amt) || amt < 1 || amt > 5000) {
    throw new Error("amountMl must be between 1 and 5000");
  }

  await waterLog().create({
    data: { userId, amountMl: Math.round(amt), day },
  });

  return getWaterSummaryForDay(userId, day);
}

export async function deleteWaterLogEntry(userId, logId) {
  const id = Number(logId);
  if (!Number.isInteger(id) || id < 1) {
    throw new Error("Invalid log id");
  }
  const log = await waterLog().findFirst({ where: { id, userId } });
  if (!log) {
    throw new Error("Log not found");
  }
  const day = log.day;
  await waterLog().delete({ where: { id } });
  return getWaterSummaryForDay(userId, day);
}

/** สรุปยอดรวม (ml) ต่อวันในเดือนปฏิทิน — day เป็น YYYY-MM-DD ตรงกับที่บันทึกใน log */
export async function getWaterTotalsForMonth(userId, year, month) {
  const y = Number(year);
  const m = Number(month);
  if (!Number.isInteger(y) || y < 1970 || y > 2100) {
    throw new Error("Invalid year");
  }
  if (!Number.isInteger(m) || m < 1 || m > 12) {
    throw new Error("Invalid month (1–12)");
  }
  const prefix = `${y}-${String(m).padStart(2, "0")}-`;

  const rows = await waterLog().groupBy({
    by: ["day"],
    where: {
      userId,
      day: { startsWith: prefix },
    },
    _sum: { amountMl: true },
  });

  const totals = {};
  for (const row of rows) {
    totals[row.day] = row._sum.amountMl ?? 0;
  }
  return totals;
}
