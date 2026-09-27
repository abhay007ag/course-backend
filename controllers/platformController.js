import Platform from "../models/Platform.js";
import Course from "../models/Course.js";

// GET /api/platforms
export const getPlatforms = async (req, res) => {
  try {
    const platforms = await Platform.find().sort({ name: 1 });
    const withCounts = await Promise.all(
      platforms.map(async (p) => ({
        ...p.toObject(),
        courseCount: await Course.countDocuments({ platform: p.name }),
      }))
    );
    res.json({ platforms: withCounts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/platforms/:slug
export const getPlatformBySlug = async (req, res) => {
  try {
    const platform = await Platform.findOne({ slug: req.params.slug });
    if (!platform) return res.status(404).json({ message: "Platform not found" });
    const courseCount = await Course.countDocuments({ platform: platform.name });
    res.json({ ...platform.toObject(), courseCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
