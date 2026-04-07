// backend/controllers/gardenController.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const VALID_FEATURES = ['calorie', 'mood', 'sleep', 'water', 'step'];

// เพิ่ม export const หน้าฟังก์ชันทุกตัว
export const getGardenMonth = async (req, res) => {
  try {
    const userId = req.user.id;
    const year  = parseInt(req.query.year)  || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;

    const garden = await prisma.gardenMonth.upsert({
      where: { userId_year_month: { userId, year, month } },
      update: {},
      create: { userId, year, month, treeCount: 0 },
    });

    const earnedDays = await prisma.gardenEarnedDay.findMany({
      where: { userId, year, month },
      select: { earnedDate: true, featuresCompleted: true },
      orderBy: { earnedDate: 'asc' },
    });

    const selectedFeatures = await prisma.userSelectedFeature.findMany({
      where: { userId },
      select: { featureKey: true },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLogs = await prisma.dailyFeatureLog.findMany({
      where: { userId, logDate: today },
      select: { featureKey: true },
    });

    return res.json({
      success: true,
      data: {
        year,
        month,
        treeCount: garden.treeCount,
        earnedDays: earnedDays.map(d => ({
          date: d.earnedDate,
          features: d.featuresCompleted,
        })),
        selectedFeatures: selectedFeatures.map(f => f.featureKey),
        todayCompletedFeatures: todayLogs.map(l => l.featureKey),
      },
    });
  } catch (err) {
    console.error('getGardenMonth error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const logFeature = async (req, res) => {
  try {
    const userId = req.user.id;
    const { featureKey } = req.body;

    if (!VALID_FEATURES.includes(featureKey)) {
      return res.status(400).json({ success: false, message: 'Invalid feature key' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyFeatureLog.upsert({
      where: {
        userId_featureKey_logDate: { userId, featureKey, logDate: today },
      },
      update: {},
      create: { userId, featureKey, logDate: today },
    });

    const selectedFeatures = await prisma.userSelectedFeature.findMany({
      where: { userId },
      select: { featureKey: true },
    });

    const selectedKeys = selectedFeatures.map(f => f.featureKey);
    const targetFeatures = selectedKeys.length > 0 ? selectedKeys : VALID_FEATURES;

    const todayLogs = await prisma.dailyFeatureLog.findMany({
      where: { userId, logDate: today },
      select: { featureKey: true },
    });
    const completedKeys = todayLogs.map(l => l.featureKey);

    const allCompleted = targetFeatures.every(k => completedKeys.includes(k));

    let treeGrown = false;
    let treeCount = null;

    if (allCompleted) {
      const year  = today.getFullYear();
      const month = today.getMonth() + 1;

      const alreadyEarned = await prisma.gardenEarnedDay.findUnique({
        where: { userId_earnedDate: { userId, earnedDate: today } },
      });

      if (!alreadyEarned) {
        const result = await prisma.$transaction(async (tx) => {
          const garden = await tx.gardenMonth.upsert({
            where: { userId_year_month: { userId, year, month } },
            update: { treeCount: { increment: 1 } },
            create: { userId, year, month, treeCount: 1 },
          });

          await tx.gardenEarnedDay.create({
            data: {
              userId,
              earnedDate: today,
              year,
              month,
              featuresCompleted: targetFeatures,
              gardenMonthId: garden.id,
            },
          });

          return garden;
        });

        treeGrown = true;
        treeCount = result.treeCount;
      }
    }

    return res.json({
      success: true,
      data: {
        featureKey,
        completedToday: completedKeys,
        targetFeatures,
        allCompleted,
        treeGrown,
        treeCount,
      },
    });
  } catch (err) {
    console.error('logFeature error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getTodayProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const today  = new Date();
    today.setHours(0, 0, 0, 0);

    const [selectedFeatures, todayLogs, alreadyEarned] = await Promise.all([
      prisma.userSelectedFeature.findMany({
        where: { userId },
        select: { featureKey: true },
      }),
      prisma.dailyFeatureLog.findMany({
        where: { userId, logDate: today },
        select: { featureKey: true },
      }),
      prisma.gardenEarnedDay.findUnique({
        where: { userId_earnedDate: { userId, earnedDate: today } },
      }),
    ]);

    const selectedKeys  = selectedFeatures.map(f => f.featureKey);
    const completedKeys = todayLogs.map(l => l.featureKey);
    const targetFeatures = selectedKeys.length > 0 ? selectedKeys : VALID_FEATURES;

    return res.json({
      success: true,
      data: {
        targetFeatures,
        completedFeatures: completedKeys,
        completedCount: targetFeatures.filter(k => completedKeys.includes(k)).length,
        totalCount: targetFeatures.length,
        treeEarnedToday: !!alreadyEarned,
      },
    });
  } catch (err) {
    console.error('getTodayProgress error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const selectFeatures = async (req, res) => {
  try {
    const userId = req.user.id;
    const { featureKeys } = req.body;

    if (!Array.isArray(featureKeys) || featureKeys.length === 0) {
      return res.status(400).json({ success: false, message: 'featureKeys must be a non-empty array' });
    }

    const invalid = featureKeys.filter(k => !VALID_FEATURES.includes(k));
    if (invalid.length > 0) {
      return res.status(400).json({ success: false, message: `Invalid features: ${invalid.join(', ')}` });
    }

    await prisma.$transaction([
      prisma.userSelectedFeature.deleteMany({ where: { userId } }),
      prisma.userSelectedFeature.createMany({
        data: featureKeys.map(k => ({ userId, featureKey: k })),
      }),
    ]);

    return res.json({
      success: true,
      data: { selectedFeatures: featureKeys },
    });
  } catch (err) {
    console.error('selectFeatures error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getGardenSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const months = await prisma.gardenMonth.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return res.json({
      success: true,
      data: { months },
    });
  } catch (err) {
    console.error('getGardenSummary error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
