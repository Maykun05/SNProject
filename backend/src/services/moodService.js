// import prisma from "../config/prisma.js";
// import { updateTreeProgress } from "./treeService.js";

// export const setMoodService = async (userId, mood, date) => {
//   const targetDate = new Date(date);
//   targetDate.setHours(0, 0, 0, 0);

//   const result = await prisma.moodLog.upsert({
//     where: {
//       userId_date: {
//         userId,
//         date: targetDate,
//       },
//     },
//     update: {
//       mood,
//     },
//     create: {
//       userId,
//       mood,
//       date: targetDate,
//     },
//   });

//   // update tree
//   await updateTreeProgress(userId);

//   return result;
// };

// export const getMoodByMonthService = async (userId, month, year) => {
//   const start = new Date(year, month - 1, 1);
//   const end = new Date(year, month, 0);

//   const moods = await prisma.moodLog.findMany({
//     where: {
//       userId,
//       date: {
//         gte: start,
//         lte: end,
//       },
//     },
//   });

//   return moods;
// };

// export const getTodayMoodService = async (userId) => {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   const mood = await prisma.moodLog.findFirst({
//     where: {
//       userId,
//       date: today,
//     },
//   });

//   return mood;
// };
import prisma from "../config/prisma.js";

// 🔹 ดึงทั้งเดือน
export const fetchMoodsByMonth = async (userId, month, year) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);

  return await prisma.moodLog.findMany({
    where: {
      userId,
      date: {
        gte: start,
        lte: end,
      },
    },
    orderBy: { date: "asc" },
  });
};

// 🔹 ดึงวันนี้
export const fetchTodayMood = async (userId) => {
  const now = new Date();

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  return await prisma.moodLog.findFirst({
    where: {
      userId,
      date: {
        gte: start,
        lte: end,
      },
    },
  });
};

// 🔹 save / update
export const upsertMood = async (userId, date, mood) => {
  const dateObj = new Date(date + "T00:00:00"); // 🔥 กัน timezone เพี้ยน

  return await prisma.moodLog.upsert({
    where: {
      userId_date: {
        userId,
        date: dateObj,
      },
    },
    update: {
      mood,
    },
    create: {
      userId,
      mood,
      date: dateObj,
    },
  });
};