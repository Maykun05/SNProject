// นำเข้า Models ที่เกี่ยวข้อง
const { Food_Log, Food_Menu, User_Data } = require('../models');
const { Op } = require('sequelize');

// 1. ฟังก์ชันเพิ่มการบันทึกอาหาร (หน้า cal ใน Figma)
exports.addFoodLog = async (req, res) => {
    try {
        const { user_id, menu_id, amount, log_date, log_time } = req.body;

        // บันทึกข้อมูลลงตาราง Food_Log
        const newLog = await Food_Log.create({
            user_id,
            menu_id,
            amount,
            log_date: log_date || new Date(),
            log_time: log_time || new Date().toLocaleTimeString('it-IT') // รูปแบบ HH:mm:ss
        });

        // --- ระบบ Gamification: เมื่อบันทึกอาหารสำเร็จ ให้เพิ่ม EXP ต้นไม้ ---
        const userData = await User_Data.findOne({ where: { user_id } });
        if (userData) {
            const addedExp = 20; // บันทึกอาหารให้ 20 EXP
            const newExp = (userData.tree_exp || 0) + addedExp;
            
            // คำนวณ Level (0-5) ทุกๆ 100 EXP
            let newLevel = Math.floor(newExp / 100);
            if (newLevel > 5) newLevel = 5;

            await userData.update({
                tree_exp: newExp,
                tree_level: newLevel
            });

            return res.status(201).json({
                success: true,
                message: "บันทึกอาหารและเพิ่ม EXP สำเร็จ",
                data: newLog,
                tree_status: { current_level: newLevel, current_exp: newExp }
            });
        }

        res.status(201).json({ success: true, data: newLog });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "ไม่สามารถบันทึกข้อมูลอาหารได้" });
    }
};

// 2. ฟังก์ชันดึงรายการอาหารของวันนี้ (เพื่อแสดงในหน้า calGoal / cal ใน Figma)
exports.getFoodToday = async (req, res) => {
    try {
        const { userId } = req.params;
        const today = new Date().toISOString().split('T')[0]; // ดึงเฉพาะวันที่ YYYY-MM-DD

        const logs = await Food_Log.findAll({
            where: {
                user_id: userId,
                log_date: today
            },
            include: [{ model: Food_Menu }] // Join กับตาราง Food_Menu เพื่อเอาค่า calories/ชื่ออาหาร
        });

        // คำนวณผลรวมแคลอรี่ของวันนี้
        const totalCalories = logs.reduce((sum, item) => {
            return sum + (Number(item.Food_Menu.calories) * Number(item.amount));
        }, 0);

        res.json({
            success: true,
            date: today,
            totalCalories: totalCalories,
            items: logs
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};