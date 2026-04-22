import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import {
  formatLocalDate,
  monthPeriodKey,
  startOfDay,
  weekPeriodKey,
} from "./missionSyncService.js";
import { applyXpInTransaction } from "./userXpService.js";

export const createUser = async ({ username, email, password }) => {
  const hashedPassword = await bcrypt.hash(password, 10); // 🔥 ตรงนี้

  return prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword, // ❗ เก็บ hash ไม่ใช่ password จริง
    },
  });
};

export const getUser = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      // ❌ ไม่ควรส่ง password ออกไป
    },
  });
};

// ✅ อัปเดตข้อมูล user
export const updateUser = async (userId, data) => {
  const updateData = {};

  if (data.username) updateData.username = data.username;
  if (data.email) updateData.email = data.email;
  if (data.password) {
    const hashed = await bcrypt.hash(data.password, 10);
    updateData.password = hashed;
  }

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      username: true,
      email: true,
    },
  });
};

// export const updateProfile = async (userId, data) => {
//   return prisma.profile.update({
//     where: { userId },
//     data,
//   });
// };

export const getProfile = async (userId) => {
  return prisma.profile.findUnique({
    where: { userId },
  });
};

// export const findUserByEmail = async (email) => {
//   return prisma.user.findUnique({
//     where: { email },
//   });
// };

export const updateUserProfile = async (userId, data) => {
  const patch = {};
  if (data.weight !== undefined) patch.weight = data.weight;
  if (data.height !== undefined) patch.height = data.height;
  if (data.birthDate !== undefined) {
    patch.birthDate = data.birthDate ? new Date(data.birthDate) : null;
  }
  if (data.activityLevel !== undefined) patch.activityLevel = data.activityLevel;
  if (data.gender !== undefined) patch.gender = data.gender;
  if (data.calorieGoal !== undefined) patch.calorieGoal = data.calorieGoal;
  if (data.waterGoal !== undefined) patch.waterGoal = data.waterGoal;
  if (data.profileImage !== undefined) patch.profileImage = data.profileImage;
  if (data.settings !== undefined) patch.settings = data.settings;
  // selectedTreeType: ใช้ PUT /api/tree-type เท่านั้น (มี validation + unlock)

  return prisma.profile.upsert({
    where: { userId },
    update: patch,
    create: {
      userId,
      ...patch,
    },
  });
};
 
// ไว้ใช้กับ profileprovider (ไม่ส่ง password)
export const getUserWithProfile = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      coins: true,
      xp: true,
      level: true,
      totalXp: true,
      profile: true,
    },
  });
};

/** เพิ่ม XP จากกิจกรรม (นอน / อารมณ์ ฯลฯ) — จำกัดต่อครั้งกันสแปม */
export const applyXpGrant = async (userId, amount) => {
  const a = Math.floor(Number(amount));
  if (!Number.isFinite(a) || a <= 0) {
    throw new Error("Invalid amount");
  }
  if (a > 500) {
    throw new Error("Amount too large");
  }
  return prisma.$transaction((tx) => applyXpInTransaction(tx, userId, a));
};

export const registerUser = async ({
  username,
  email,
  password,
  recoveryQuestion,
  recoveryAnswer,
}) => {
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new Error("Email already exists");
  }

  const q = typeof recoveryQuestion === "string" ? recoveryQuestion.trim() : "";
  const rawAnswer =
    typeof recoveryAnswer === "string" ? recoveryAnswer.trim() : "";
  const normalizedAnswer = rawAnswer.toLowerCase();

  if (!q || q.length < 5) {
    throw new Error("Recovery question must be at least 5 characters");
  }
  if (!normalizedAnswer || normalizedAnswer.length < 4) {
    throw new Error("Recovery answer must be at least 4 characters");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const recoveryAnswerHash = await bcrypt.hash(normalizedAnswer, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      recoveryQuestion: q,
      recoveryAnswerHash,
    },
  });

  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Wrong password");
  }

  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    }, 
  };
};

export const getRecoveryQuestionByEmail = async (rawEmail) => {
  const email = typeof rawEmail === "string" ? rawEmail.trim() : "";
  if (!email) {
    throw new Error("กรุณากรอกอีเมล");
  }
  const user = await prisma.user.findUnique({
    where: { email },
    select: { recoveryQuestion: true, recoveryAnswerHash: true },
  });
  if (!user) {
    throw new Error("ไม่พบบัญชี");
  }
  if (!user.recoveryQuestion || !user.recoveryAnswerHash) {
    throw new Error("บัญชีนี้ยังไม่ได้ตั้งคำถามกู้คืน");
  }
  return { recoveryQuestion: user.recoveryQuestion };
};

export const resetPasswordWithRecovery = async ({
  email: rawEmail,
  recoveryAnswer,
  newPassword,
}) => {
  const email = typeof rawEmail === "string" ? rawEmail.trim() : "";
  const rawAnswer =
    typeof recoveryAnswer === "string" ? recoveryAnswer.trim() : "";
  const normalizedAnswer = rawAnswer.toLowerCase();
  if (!email) {
    throw new Error("กรุณากรอกอีเมล");
  }
  if (!normalizedAnswer) {
    throw new Error("กรุณากรอกคำตอบ");
  }
  const pwd = typeof newPassword === "string" ? newPassword : "";
  if (pwd.length < 6) {
    throw new Error("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, recoveryAnswerHash: true },
  });
  if (!user) {
    throw new Error("ไม่พบบัญชี");
  }
  if (!user.recoveryAnswerHash) {
    throw new Error("บัญชีนี้ยังไม่ได้ตั้งคำถามกู้คืน");
  }

  const ok = await bcrypt.compare(normalizedAnswer, user.recoveryAnswerHash);
  if (!ok) {
    throw new Error("คำตอบไม่ถูกต้อง");
  }

  const hashedPassword = await bcrypt.hash(pwd, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });
  return { success: true };
};

export const getProfileStatsService = async (userId) => {
  const t = startOfDay(new Date());
  const activePeriodKeys = [formatLocalDate(t), weekPeriodKey(t), monthPeriodKey(t)];

  const [profile, userRow, missions, progress, mood, sleep] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.user.findUnique({ where: { id: userId }, select: { coins: true } }),
    prisma.missionProgress.count({
      where: { userId, isCompleted: true, periodKey: { in: activePeriodKeys } },
    }),
    prisma.dailyProgress.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 7,
    }),
    prisma.moodLog.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
    }),
    prisma.sleep.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 7,
    }),
  ]);

  const avgSleep = sleep.length
    ? sleep.reduce((sum, s) => sum + s.hours, 0) / sleep.length
    : null;

  return {
    coins: userRow?.coins ?? 0,
    totalMissionsCompleted: missions,
    latestMood: mood?.mood ?? null,
    avgSleepHours: avgSleep,
    recentProgress: progress,
  };
};

