import prisma from "../config/prisma.js";

export const createUserService = async (data) => {
  const { username, weight, height, age, activityLevel } = data;

  const user = await prisma.user.create({
    data: {
      username,
      weight,
      height,
      age,
      activityLevel,
    },
  });

  return user;
};

export const getUsersService = async () => {
  return await prisma.user.findMany();
};



