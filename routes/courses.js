import express from "express";
import {
  getCourses,
  getCourseById,
  compareCourses,
  getFreeCourses,
  getTrendingCourses,
  getSearchSuggestions,
} from "../controllers/courseController.js";

const router = express.Router();

router.get("/", getCourses);
router.post("/compare", compareCourses);
router.get("/free/browse", getFreeCourses);
router.get("/trending/list", getTrendingCourses);
router.get("/search/suggestions", getSearchSuggestions);
router.get("/:id", getCourseById);

export default router;
