import prisma from "../config/prisma.js";

export const FoodService = {
  async addFood(userId, data) {
    return prisma.foodLog.create({
      data: {
        userId,
        name: data.name,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        date: new Date()
      }
    });
  },

  async getFoodsToday(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return prisma.foodLog.findMany({
      where: {
        userId,
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      orderBy: { date: "desc" }
    });
  },

  async deleteFood(id) {
    return prisma.foodLog.delete({
      where: { id }
    });
  }
};
