import LearningPath from "../models/LearningPath.js";

// GET /api/learning-paths
export const getAllPaths = async (req, res) => {
  try {
    const paths = await LearningPath.find();
    res.json({ paths });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/learning-paths/:pathId  (e.g. "python", "web-development")
export const getPathById = async (req, res) => {
  try {
    const path = await LearningPath.findOne({ pathId: req.params.pathId }).populate(
      "steps.recommendedCourseIds"
    );
    if (!path) return res.status(404).json({ message: "Learning path not found" });
    res.json(path);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/learning-paths/by-topic/:topic
export const getPathByTopic = async (req, res) => {
  try {
    const path = await LearningPath.findOne({
      topic: { $regex: `^${req.params.topic}$`, $options: "i" },
    }).populate("steps.recommendedCourseIds");
    if (!path) return res.status(404).json({ message: "No learning path for this topic yet" });
    res.json(path);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
