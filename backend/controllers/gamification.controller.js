// controllers/gamification.controller.js
import Progress from "../models/progress.model.js";
import User from "../models/user.model.js";

export const getAllProgress = async (req, res) => {
  try {
    const allProgress = await Progress.find().populate("userId", "name email role");
    res.json(allProgress || []);
  } catch (err) {
    console.error("Error fetching all progress:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getUserProgress = async (req, res) => {
  try {
    const { id } = req.params;
    
    let progress = await Progress.findOne({ userId: id });
    
    // If progress doesn't exist, create it
    if (!progress) {
      console.log("Progress not found for user:", id, "- creating new record");
      progress = await Progress.create({
        userId: id,
        xp: 0,
        level: 1,
        earnedBadges: [],
        completedModules: 0,
        perfectQuizzes: 0,
        drillsCompleted: 0,
        dailyStreak: 0,
      });
    }
    
    res.json(progress);
  } catch (err) {
    console.error("Error fetching user progress:", err);
    res.status(500).json({ error: err.message });
  }
};

export const updateUserProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { xpGain, badgeEarned, streak, drillsCompleted, perfectQuizzes } = req.body;

    let progress = await Progress.findOne({ userId: id });

    if (!progress) {
      progress = await Progress.create({
        userId: id,
        xp: xpGain || 0,
        level: Math.floor((xpGain || 0) / 1000) + 1,
        earnedBadges: badgeEarned ? [badgeEarned] : [],
        dailyStreak: streak || 0,
        drillsCompleted: drillsCompleted || 0,
        perfectQuizzes: perfectQuizzes || 0,
      });
    } else {
      progress.xp += xpGain || 0;
      progress.dailyStreak = streak !== undefined ? streak : progress.dailyStreak;
      
      if (badgeEarned && !progress.earnedBadges.includes(badgeEarned)) {
        progress.earnedBadges.push(badgeEarned);
      }

      if (drillsCompleted !== undefined) {
        progress.drillsCompleted = drillsCompleted;
      }
      if (perfectQuizzes !== undefined) {
        progress.perfectQuizzes = perfectQuizzes;
      }

      progress.level = Math.floor(progress.xp / 1000) + 1;
      progress.lastUpdated = new Date();
    }

    await progress.save();

    // Also update user stats
    if (id) {
      await User.findByIdAndUpdate(
        id,
        {
          "stats.xp": progress.xp,
          "stats.level": progress.level,
          "stats.badges": progress.earnedBadges.length,
          "stats.streak": progress.dailyStreak,
          "stats.drillsCompleted": progress.drillsCompleted,
        }
      );
    }

    res.json(progress);
  } catch (err) {
    console.error("Error updating user progress:", err);
    res.status(500).json({ error: err.message });
  }
};
