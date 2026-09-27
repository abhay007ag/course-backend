import express from "express";
import { protect } from "../middleware/auth.js";
import {
  toggleSavedCourse,
  getSavedCourses,
  startLearningPath,
  updateStepStatus,
  getMyLearningPaths,
  addRecentSearch,
} from "../controllers/userController.js";

const router = express.Router();

router.use(protect);

router.get("/saved", getSavedCourses);
router.post("/saved/:courseId", toggleSavedCourse);

router.get("/learning-paths", getMyLearningPaths);
router.post("/learning-paths/:pathId/start", startLearningPath);
router.patch("/learning-paths/:pathId/steps/:stepIndex", updateStepStatus);

router.post("/recent-searches", addRecentSearch);

export default router;
