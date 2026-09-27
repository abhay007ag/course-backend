import mongoose from "mongoose";

// A template learning path for a topic (e.g. "python", "web-development")
// Admins curate these; users "start" one, which copies its steps into their profile.
const learningPathSchema = new mongoose.Schema(
  {
    pathId: { type: String, required: true, unique: true }, // slug, e.g. "python"
    title: { type: String, required: true },
    topic: { type: String, required: true }, // matches Course.category for suggestions
    description: { type: String, default: "" },
    steps: [
      {
        stepLabel: { type: String, required: true }, // "Step 1 - Python Basics"
        subtopics: [{ type: String }],
        recommendedCourseIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("LearningPath", learningPathSchema);
