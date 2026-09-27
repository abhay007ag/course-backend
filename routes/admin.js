import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  verifyCourseLink,
  listAllCoursesForAdmin,
  createPlatform,
  updatePlatform,
  deletePlatform,
  listCategories,
  getAdminSummary,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/summary", getAdminSummary);

router.get("/courses", listAllCoursesForAdmin);
router.post("/courses", createCourse);
router.put("/courses/:id", updateCourse);
router.delete("/courses/:id", deleteCourse);
router.patch("/courses/:id/verify", verifyCourseLink);

router.post("/platforms", createPlatform);
router.put("/platforms/:id", updatePlatform);
router.delete("/platforms/:id", deletePlatform);

router.get("/categories", listCategories);

export default router;
