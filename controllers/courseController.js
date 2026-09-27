import Course from "../models/Course.js";

// Related-term expansion so a search for "python" also matches
// "python programming", "learn python", etc. Kept simple and explicit
// rather than a black box, since this project is meant to be readable.
const RELATED_TERMS = {
  python: ["python programming", "python beginner", "python development", "python tutorial", "learn python"],
  "web development": ["html", "css", "javascript", "react", "node.js", "full stack", "frontend", "backend"],
  javascript: ["js", "es6", "web development"],
  "data science": ["data analysis", "pandas", "numpy", "machine learning"],
};

function expandQuery(q) {
  const key = q.trim().toLowerCase();
  return RELATED_TERMS[key] || [];
}

// GET /api/courses?query=&price=&level=&platform=&duration=&courseType=&language=&sort=&page=&limit=
export const getCourses = async (req, res) => {
  try {
    const {
      query,
      price, // comma separated: free,paid,freemium
      level, // comma separated: beginner,intermediate,advanced
      platform, // comma separated platform names
      duration, // one of: <5, 5-20, 20-50, 50+
      courseType,
      language,
      category,
      sort = "relevance",
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};

    if (query && query.trim()) {
      const terms = [query.trim(), ...expandQuery(query)];
      filter.$or = terms.flatMap((t) => [
        { title: { $regex: t, $options: "i" } },
        { category: { $regex: t, $options: "i" } },
        { skills: { $regex: t, $options: "i" } },
      ]);
    }

    if (category) filter.category = { $regex: `^${category}$`, $options: "i" };

    if (price) filter.priceType = { $in: price.split(",") };
    if (level) filter.level = { $in: level.split(",") };
    if (platform) filter.platform = { $in: platform.split(",") };
    if (courseType) filter.courseType = { $in: courseType.split(",") };
    if (language) filter.language = { $in: language.split(",") };

    if (duration) {
      const ranges = {
        "<5": { $lt: 5 },
        "5-20": { $gte: 5, $lte: 20 },
        "20-50": { $gte: 20, $lte: 50 },
        "50+": { $gt: 50 },
      };
      if (ranges[duration]) filter.durationHours = ranges[duration];
    }

    const sortMap = {
      relevance: { featured: -1, trending: -1 },
      rating: { rating: -1 },
      popular: { studentCount: -1 },
      "duration-asc": { durationHours: 1 },
      "duration-desc": { durationHours: -1 },
      "free-first": { priceType: 1 },
      newest: { createdAt: -1 },
    };
    const sortSpec = sortMap[sort] || sortMap.relevance;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 50);

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .sort(sortSpec)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Course.countDocuments(filter),
    ]);

    res.json({
      courses,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/courses/:id
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(400).json({ message: "Invalid course id" });
  }
};

// POST /api/courses/compare  { ids: [id1, id2, id3] }
export const compareCourses = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length < 2 || ids.length > 4) {
      return res.status(400).json({ message: "Provide between 2 and 4 course ids to compare" });
    }
    const courses = await Course.find({ _id: { $in: ids } });
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/courses/free/browse?category=
export const getFreeCourses = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { priceType: "free" };
    if (category) filter.category = { $regex: `^${category}$`, $options: "i" };
    const courses = await Course.find(filter).sort({ rating: -1 }).limit(48);
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/courses/trending/list
export const getTrendingCourses = async (req, res) => {
  try {
    const courses = await Course.find({ trending: true }).sort({ studentCount: -1 }).limit(12);
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/courses/search/suggestions?q=
export const getSearchSuggestions = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json({ suggestions: [] });

    const popular = [
      "Python", "Java", "JavaScript", "Web Development", "Data Structures & Algorithms",
      "Machine Learning", "Data Science", "React", "Node.js", "SQL", "HTML", "CSS",
    ];
    const staticMatches = popular.filter((p) => p.toLowerCase().includes(q.toLowerCase()));

    const categoryMatches = await Course.distinct("category", {
      category: { $regex: q, $options: "i" },
    });

    const suggestions = [...new Set([...staticMatches, ...categoryMatches])].slice(0, 8);
    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
