import prisma from "../config/prisma.js";
import {
  HOME_GARDEN_SLOT_COUNT,
  ensureHomeGardenSlots,
  isTreeTypeUnlocked,
} from "../services/treeGardenService.js";

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
        homeSlotCount: HOME_GARDEN_SLOT_COUNT,
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

export const getTreeInventory = async (req, res) => {
  try {
    const userId = req.user.id;
    const trees = await prisma.earnedTree.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        treeType: { select: treeTypeSelect },
        placedSlot: { select: { slotIndex: true } },
      },
    });
    const data = trees.map((t) => ({
      id: t.id,
      treeTypeId: t.treeTypeId,
      source: t.source,
      refDate: t.refDate,
      createdAt: t.createdAt,
      treeType: t.treeType,
      placedSlotIndex: t.placedSlot?.slotIndex ?? null,
    }));
    return res.json({ success: true, data: { trees: data } });
  } catch (err) {
    console.error("getTreeInventory error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getHomeGardenLayout = async (req, res) => {
  try {
    const userId = req.user.id;
    await ensureHomeGardenSlots(userId);
    const slots = await prisma.homeGardenSlot.findMany({
      where: { userId },
      orderBy: { slotIndex: "asc" },
      include: {
        earnedTree: {
          include: { treeType: { select: treeTypeSelect } },
        },
      },
    });
    const data = slots.map((s) => ({
      slotIndex: s.slotIndex,
      earnedTreeId: s.earnedTreeId,
      tree: s.earnedTree
        ? {
            id: s.earnedTree.id,
            treeTypeId: s.earnedTree.treeTypeId,
            treeType: s.earnedTree.treeType,
          }
        : null,
    }));
    return res.json({
      success: true,
      data: { slots: data, slotCount: HOME_GARDEN_SLOT_COUNT },
    });
  } catch (err) {
    console.error("getHomeGardenLayout error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Body: { layout: (number|null)[] } — index = slotIndex, value = earnedTreeId หรือ null
 */
export const putHomeGardenLayout = async (req, res) => {
  try {
    const userId = req.user.id;
    const layout = req.body?.layout;
    if (!Array.isArray(layout) || layout.length !== HOME_GARDEN_SLOT_COUNT) {
      return res.status(400).json({
        success: false,
        message: `layout must be an array of length ${HOME_GARDEN_SLOT_COUNT}`,
      });
    }

    const ids = layout.filter((x) => x != null).map((x) => Number(x));
    if (ids.some((id) => !Number.isFinite(id))) {
      return res.status(400).json({ success: false, message: "Invalid earnedTree id in layout" });
    }
    if (new Set(ids).size !== ids.length) {
      return res.status(400).json({ success: false, message: "Duplicate tree in layout" });
    }

    if (ids.length) {
      const trees = await prisma.earnedTree.findMany({
        where: { userId, id: { in: ids } },
        select: { id: true },
      });
      if (trees.length !== ids.length) {
        return res.status(400).json({ success: false, message: "Invalid or foreign earned tree" });
      }
    }

    await ensureHomeGardenSlots(userId);

    await prisma.$transaction(async (tx) => {
      await tx.homeGardenSlot.updateMany({
        where: { userId },
        data: { earnedTreeId: null },
      });
      for (let slotIndex = 0; slotIndex < layout.length; slotIndex++) {
        const raw = layout[slotIndex];
        const earnedTreeId = raw == null ? null : Number(raw);
        await tx.homeGardenSlot.update({
          where: { userId_slotIndex: { userId, slotIndex } },
          data: { earnedTreeId },
        });
      }
    });

    const slots = await prisma.homeGardenSlot.findMany({
      where: { userId },
      orderBy: { slotIndex: "asc" },
      include: {
        earnedTree: {
          include: { treeType: { select: treeTypeSelect } },
        },
      },
    });

    return res.json({
      success: true,
      data: {
        slots: slots.map((s) => ({
          slotIndex: s.slotIndex,
          earnedTreeId: s.earnedTreeId,
          tree: s.earnedTree
            ? {
                id: s.earnedTree.id,
                treeTypeId: s.earnedTree.treeTypeId,
                treeType: s.earnedTree.treeType,
              }
            : null,
        })),
      },
    });
  } catch (err) {
    console.error("putHomeGardenLayout error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
