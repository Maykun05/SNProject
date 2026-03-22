import prisma from "../config/prisma.js";

// เพิ่ม feature ให้ user
export const addUserFeature = async (userId, featureId) => {
  return prisma.userFeature.create({
    data: { userId, featureId },
  });
};

// ลบ feature ของ user
export const removeUserFeature = async (userId, featureId) => {
  return prisma.userFeature.deleteMany({
    where: { userId, featureId },
  });
};

// อัปเดต feature ทั้งหมดของ user (ลบเก่าแล้วเพิ่มใหม่)
export const updateUserFeatures = async (userId, featureIds) => {
  await prisma.userFeature.deleteMany({ where: { userId } });

  const newFeatures = featureIds.map(fid => ({ userId, featureId: fid }));

  return prisma.user.update({
    where: { id: userId },
    data: {
      features: { create: newFeatures },
    },
    include: {
      features: { include: { feature: true } },
    },
  });
};

// ดึง feature ของ user
export const getUserFeatures = async (userId) => {
  return prisma.userFeature.findMany({
    where: { userId },
    include: { feature: true },
  });
};