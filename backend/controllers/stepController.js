const { Step_Log, User_Data } = require('../models');

exports.addStepLog = async (req, res) => {
    try {
        const { user_id, steps } = req.body;

        await Step_Log.create({
            user_id,
            step_count: steps,
            log_date: new Date()
        });

        // บวก EXP ต้นไม้ (15 EXP)
        const userData = await User_Data.findByPk(user_id);
        const newExp = (userData.tree_exp || 0) + 15;
        const newLevel = Math.min(Math.floor(newExp / 100), 5);

        await userData.update({ tree_exp: newExp, tree_level: newLevel });

        res.status(201).json({ success: true, tree_level: newLevel });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};