import bcrypt from "bcrypt";
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