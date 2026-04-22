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
  },

  async searchFoodByName(req, res) {
    try {
      const userId = req.user.id;
      const { name } = req.query;

      if (!name || !name.trim()) {
        return res.status(400).json({ error: "Name query is required" });
      }

      // ค้นหาจาก FoodDatabase ก่อน
      let food = await FoodService.searchFoodDatabase(name);
      if (food) {
        return res.json(food);
      }

      // ถ้าไม่เจอ ค้นหาจาก user's FoodLog
      food = await FoodService.searchFoodByName(userId, name);
      if (!food) {
        return res.status(404).json(null);
      }

      res.json(food);
    } catch (err) {
      res.status(500).json({ error: "Failed to search food" });
    }
  },

  async saveFoodToDatabase(req, res) {
    try {
      const food = await FoodService.saveFoodToDatabase(req.body);
      res.json(food);
    } catch (err) {
      res.status(500).json({ error: "Failed to save food to database" });
    }
  }
};
