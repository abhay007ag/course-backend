import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    savedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    learningPaths: [
      {
        pathId: { type: String, required: true },
        pathTitle: { type: String, required: true },
        startedAt: { type: Date, default: Date.now },
        steps: [
          {
            courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
            stepLabel: String,
            status: { type: String, enum: ["not_started", "in_progress", "completed"], default: "not_started" },
          },
        ],
      },
    ],
    recentSearches: [{ type: String }],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model("User", userSchema);
