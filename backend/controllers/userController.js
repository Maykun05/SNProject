// controllers/userController.js
const { User, User_Data } = require('../models');

exports.register = async (req, res) => {
    try {
        const { username, lastname, email, password } = req.body;
        
        // ใช้ Sequelize สร้าง User (จะ mapping กับตารางใน pgAdmin อัตโนมัติ)
        const newUser = await User.create({ username, lastname, email, password });

        // สร้างข้อมูล User_Data พร้อมค่า EXP เริ่มต้นสำหรับต้นไม้ (Main0)
        await User_Data.create({ 
            user_id: newUser.user_id,
            tree_exp: 0,
            tree_level: 0 
        });

        res.status(201).json({ success: true, data: newUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        // ดึงข้อมูล User พร้อมข้อมูล User_Data (Weight, Height, Tree Level)
        const user = await User.findByPk(req.params.id, {
            include: [{ model: User_Data }]
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};