import prisma from "../config/prisma.js";
import { isTreeTypeUnlocked } from "../services/treeGardenService.js";

const treeTypeSelect = {
  id: true,
  key: true,
  displayName: true,
  unlockCoinCost: true,
  sortOrder: true,
};

export const getTreeCatalog = async (req, res) => {
  try {
    const userId = req.user.id;
    const [types, unlockRows, user] = await Promise.all([
      prisma.treeType.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
      prisma.userTreeUnlock.findMany({ where: { userId }, select: { treeTypeId: true } }),
      prisma.user.findUnique({ where: { id: userId }, select: { coins: true } }),
    ]);
    const paidUnlock = new Set(unlockRows.map((r) => r.treeTypeId));
    const data = types.map((t) => ({
      ...t,
      unlocked: t.unlockCoinCost <= 0 || paidUnlock.has(t.id),
    }));
    return res.json({
      success: true,
      data: {
        treeTypes: data,
        coins: user?.coins ?? 0,
      },
    });
  } catch (err) {
    console.error("getTreeCatalog error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const postUnlockTreeType = async (req, res) => {
  try {
    const userId = req.user.id;
    const treeTypeId = parseInt(req.body?.treeTypeId, 10);
    if (!Number.isFinite(treeTypeId)) {
      return res.status(400).json({ success: false, message: "treeTypeId required" });
    }

    const type = await prisma.treeType.findUnique({ where: { id: treeTypeId } });
    if (!type) {
      return res.status(404).json({ success: false, message: "Tree type not found" });
    }
    if (type.unlockCoinCost <= 0) {
      return res.status(400).json({ success: false, message: "This tree is already free" });
    }
    if (await isTreeTypeUnlocked(userId, type)) {
      return res.status(400).json({ success: false, message: "Already unlocked" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.coins < type.unlockCoinCost) {
      return res.status(400).json({ success: false, message: "Not enough coins" });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { coins: { decrement: type.unlockCoinCost } },
      }),
      prisma.coinTransaction.create({
        data: {
          userId,
          amount: -type.unlockCoinCost,
          source: "TREE_UNLOCK",
        },
      }),
      prisma.userTreeUnlock.create({
        data: { userId, treeTypeId },
      }),
    ]);

    const updated = await prisma.user.findUnique({
      where: { id: userId },
      select: { coins: true },
    });

    return res.json({
      success: true,
      data: { treeTypeId, coins: updated?.coins ?? 0 },
    });
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(400).json({ success: false, message: "Already unlocked" });
    }
    console.error("postUnlockTreeType error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
