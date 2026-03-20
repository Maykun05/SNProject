const { Emotion_Log, User_Data } = require('../models');

exports.addMoodLog = async (req, res) => {
    try {
        const { user_id, emotion_id, note } = req.body;

        await Emotion_Log.create({
            user_id,
            emotion_id,
            note,
            log_date: new Date()
        });

        // บวก EXP ต้นไม้ (5 EXP)
        const userData = await User_Data.findByPk(user_id);
        const newExp = (userData.tree_exp || 0) + 5;
        const newLevel = Math.min(Math.floor(newExp / 100), 5);

        await userData.update({ tree_exp: newExp, tree_level: newLevel });

        res.status(201).json({ success: true, tree_level: newLevel });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};