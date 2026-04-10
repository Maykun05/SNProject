import { FoodService } from "../services/foodService.js";

export const FoodController = {
  async addFood(req, res) {
    try {
      const userId = req.user.id; // มาจาก JWT middleware
      const food = await FoodService.addFood(userId, req.body);
      res.json(food);
    } catch (err) {
      res.status(500).json({ error: "Failed to add food" });
    }
  },

  async getFoodsToday(req, res) {
    try {
      const userId = req.user.id;
      const foods = await FoodService.getFoodsToday(userId);
      res.json(foods);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch foods" });
    }
  },

  async deleteFood(req, res) {
    try {
      const { id } = req.params;
      await FoodService.deleteFood(parseInt(id));
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete food" });
    }
  }
};
