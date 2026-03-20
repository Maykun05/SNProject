import {createUserService,getUsersService,} from "../services/userService.js";

export const createUser = async (req, res) => {
  try {
    const user = await createUserService(req.body);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await getUsersService();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};