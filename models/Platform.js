import mongoose from "mongoose";

const platformSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    logoUrl: { type: String, default: "" },
    websiteUrl: { type: String, required: true },
    pricingInfo: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Platform", platformSchema);
