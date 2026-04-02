import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

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

export const getUserProfile = async (userId) => {
  return prisma.profile.findUnique({
    where: { userId },
    select: {
      weight: true,
      height: true,
      birthDate: true,
      activityLevel: true,
      gender: true,
    },
  });
};

export const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const updateUserProfile = async (userId, data) => {
  return prisma.profile.upsert({
    where: { userId },
    update: {
      weight: data.weight,
      height: data.height,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      activityLevel: data.activityLevel,
      gender: data.gender,
    },
    create: {
      userId,
      weight: data.weight,
      height: data.height,
      birthDate: data.birthDate ? new Date(data.birthDate) : null,
      activityLevel: data.activityLevel,
      gender: data.gender,
    },
  });
};

export const getUserById = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      profile: true,
      features: { include: { feature: true } },
      moods: true,
      progress: true,
    },
  });
};

export const registerUser = async ({ username, email, password }) => {
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
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

export const getProfileStatsService = async (userId) => {
  const [profile, missions, progress, mood, sleep] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.missionProgress.count({ where: { userId, isCompleted: true } }),
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
    coins: profile?.coins ?? 0,
    totalMissionsCompleted: missions,
    latestMood: mood?.mood ?? null,
    avgSleepHours: avgSleep,
    recentProgress: progress,
  };
};

