import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    platform: { type: String, required: true, trim: true }, // e.g. "YouTube", "Udemy"
    instructor: { type: String, default: "" },
    sourceUrl: { type: String, required: true }, // link to the ORIGINAL course - never host content
    thumbnailUrl: { type: String, default: "" },

    priceType: { type: String, enum: ["free", "paid", "freemium"], required: true },
    price: { type: Number, default: 0 }, // 0 for free; list price for paid/freemium

    level: { type: String, enum: ["beginner", "intermediate", "advanced"], required: true },
    durationHours: { type: Number, required: true },

    courseType: { type: String, enum: ["video", "tutorial", "certification", "project-based"], default: "video" },
    language: { type: String, default: "English" },

    category: { type: String, required: true }, // e.g. "Python", "Web Development"
    skills: [{ type: String }],
    prerequisites: [{ type: String }],
    whatYouWillLearn: [{ type: String }],
    curriculum: [
      {
        sectionTitle: String,
        items: [String],
      },
    ],

    hasCertificate: { type: Boolean, default: false },

    // Demo/placeholder metrics - clearly flagged as sample data when not sourced from a real API
    rating: { type: Number, min: 0, max: 5, default: null },
    reviewCount: { type: Number, default: null },
    studentCount: { type: Number, default: null },
    isSampleData: { type: Boolean, default: true },

    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },

    lastVerified: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

courseSchema.index({ title: "text", category: "text", skills: "text", description: "text" });

export default mongoose.model("Course", courseSchema);
