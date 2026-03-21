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

export const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const updateUserProfile = async (userId, data) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      weight: data.weight,
      height: data.height,
      birthDate: data.birthDate
        ? new Date(data.birthDate)
        : null,
      activityLevel: data.activityLevel,
      gender: data.gender,
    },
  });
};

export const updateUserFeatures = async (userId, features) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      selectedFeatures: features,
    },
  });
};

export const getUserById = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
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

  return { token };
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

  return { token };
};