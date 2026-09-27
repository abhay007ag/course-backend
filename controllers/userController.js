import User from "../models/User.js";
import Course from "../models/Course.js";
import LearningPath from "../models/LearningPath.js";

// POST /api/users/saved/:courseId - toggle bookmark
export const toggleSavedCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const user = await User.findById(req.user._id);
    const idx = user.savedCourses.findIndex((c) => c.toString() === courseId);
    let saved;
    if (idx >= 0) {
      user.savedCourses.splice(idx, 1);
      saved = false;
    } else {
      user.savedCourses.push(courseId);
      saved = true;
    }
    await user.save();
    res.json({ saved, savedCourses: user.savedCourses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/saved
export const getSavedCourses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("savedCourses");
    res.json({ courses: user.savedCourses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users/learning-paths/:pathId/start
export const startLearningPath = async (req, res) => {
  try {
    const { pathId } = req.params;
    const template = await LearningPath.findOne({ pathId });
    if (!template) return res.status(404).json({ message: "Learning path not found" });

    const user = await User.findById(req.user._id);
    const already = user.learningPaths.find((p) => p.pathId === pathId);
    if (already) return res.status(409).json({ message: "You already started this learning path" });

    user.learningPaths.push({
      pathId: template.pathId,
      pathTitle: template.title,
      steps: template.steps.map((s) => ({
        stepLabel: s.stepLabel,
        courseId: s.recommendedCourseIds?.[0] || undefined,
        status: "not_started",
      })),
    });
    await user.save();
    res.status(201).json({ learningPaths: user.learningPaths });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/users/learning-paths/:pathId/steps/:stepIndex
export const updateStepStatus = async (req, res) => {
  try {
    const { pathId, stepIndex } = req.params;
    const { status } = req.body;
    if (!["not_started", "in_progress", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findById(req.user._id);
    const path = user.learningPaths.find((p) => p.pathId === pathId);
    if (!path) return res.status(404).json({ message: "You have not started this learning path" });

    const idx = parseInt(stepIndex, 10);
    if (!path.steps[idx]) return res.status(404).json({ message: "Step not found" });

    path.steps[idx].status = status;
    await user.save();
    res.json({ learningPaths: user.learningPaths });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/learning-paths
export const getMyLearningPaths = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("learningPaths.steps.courseId");
    res.json({ learningPaths: user.learningPaths });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/users/recent-searches  { term }
export const addRecentSearch = async (req, res) => {
  try {
    const { term } = req.body;
    if (!term || !term.trim()) return res.status(400).json({ message: "Search term is required" });

    const user = await User.findById(req.user._id);
    user.recentSearches = [term.trim(), ...user.recentSearches.filter((t) => t !== term.trim())].slice(0, 10);
    await user.save();
    res.json({ recentSearches: user.recentSearches });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
