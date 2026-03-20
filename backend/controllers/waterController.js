// ดึง Models มาใช้งาน (Sequelize จะจัดการเรื่องความสัมพันธ์ให้เอง)
const { Water_Log, User_Data } = require('../models');

// 1. ฟังก์ชันบันทึกการดื่มน้ำ และเพิ่ม EXP ให้ต้นไม้
exports.addWaterLog = async (req, res) => {
    try {
        const { user_id, amount } = req.body;

        // บันทึกลงตาราง Water_Log โดยใช้ Model (ไม่ต้องเขียน SQL เอง)
        const newLog = await Water_Log.create({
            user_id: user_id,
            amount_ml: amount,
            log_date: new Date()
        });

        // --- ระบบ Gamification (ทำให้ต้นไม้โต) ---
        // ค้นหาข้อมูลผู้ใช้เพื่ออัปเดต EXP
        const userData = await User_Data.findOne({ where: { user_id: user_id } });
        
        if (userData) {
            // ดื่มน้ำ 1 ครั้ง สมมติให้ได้ 10 EXP
            const currentExp = userData.tree_exp || 0;
            const newExp = currentExp + 10;
            
            // Logic: ทุกๆ 100 EXP เลเวลอัป (0-5) ตามหน้า Main ใน Figma
            let newLevel = Math.floor(newExp / 100);
            if (newLevel > 5) newLevel = 5; // ตันที่เลเวล 5 (Main5)

            // บันทึกค่าใหม่ลงฐานข้อมูล
            await userData.update({
                tree_exp: newExp,
                tree_level: newLevel
            });

            return res.json({
                success: true,
                message: "บันทึกการดื่มน้ำสำเร็จ!",
                data: newLog,
                tree_status: {
                    added_exp: 10,
                    current_level: newLevel
                }
            });
        }

        res.json({ success: true, data: newLog });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
    }
};

// 2. ฟังก์ชันดึงยอดรวมน้ำของวันนี้ (เพื่อแสดงในหน้า water ของ Figma)
exports.getWaterToday = async (req, res) => {
    try {
        const { userId } = req.params;
        const { Op } = require('sequelize');
        
        // กำหนดช่วงเวลาของวันนี้ (00:00 - 23:59)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // ใช้ Sequelize Sum ข้อมูล
        const totalAmount = await Water_Log.sum('amount_ml', {
            where: {
                user_id: userId,
                log_date: {
                    [Op.gte]: startOfDay
                }
            }
        });

        res.json({ total: totalAmount || 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};