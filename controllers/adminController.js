import Course from "../models/Course.js";
import Platform from "../models/Platform.js";
import User from "../models/User.js";

// ---- Courses ----

// POST /api/admin/courses
export const createCourse = async (req, res) => {
  try {
    const course = await Course.create({ ...req.body, lastVerified: new Date() });
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/admin/courses/:id
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastVerified: new Date() },
      { new: true, runValidators: true }
    );
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/admin/courses/:id
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PATCH /api/admin/courses/:id/verify - mark link as re-checked today
export const verifyCourseLink = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { lastVerified: new Date() },
      { new: true }
    );
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/admin/courses (all courses incl. non-featured, paginated, for the admin table)
export const listAllCoursesForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const [courses, total] = await Promise.all([
      Course.find().sort({ updatedAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
      Course.countDocuments(),
    ]);
    res.json({ courses, total, page: pageNum, pages: Math.ceil(total / limitNum) || 1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---- Platforms ----

// POST /api/admin/platforms
export const createPlatform = async (req, res) => {
  try {
    const platform = await Platform.create(req.body);
    res.status(201).json(platform);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/admin/platforms/:id
export const updatePlatform = async (req, res) => {
  try {
    const platform = await Platform.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!platform) return res.status(404).json({ message: "Platform not found" });
    res.json(platform);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/admin/platforms/:id
export const deletePlatform = async (req, res) => {
  try {
    const platform = await Platform.findByIdAndDelete(req.params.id);
    if (!platform) return res.status(404).json({ message: "Platform not found" });
    res.json({ message: "Platform deleted" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ---- Categories (derived from Course.category, no separate collection needed yet) ----

// GET /api/admin/categories
export const listCategories = async (req, res) => {
  try {
    const categories = await Course.distinct("category");
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---- Dashboard summary ----

// GET /api/admin/summary
export const getAdminSummary = async (req, res) => {
  try {
    const [totalCourses, freeCourses, paidCourses, freemiumCourses, totalUsers, totalPlatforms, staleLinks] =
      await Promise.all([
        Course.countDocuments(),
        Course.countDocuments({ priceType: "free" }),
        Course.countDocuments({ priceType: "paid" }),
        Course.countDocuments({ priceType: "freemium" }),
        User.countDocuments(),
        Platform.countDocuments(),
        Course.countDocuments({ lastVerified: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } }),
      ]);
    res.json({ totalCourses, freeCourses, paidCourses, freemiumCourses, totalUsers, totalPlatforms, staleLinks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
