import express from "express";
import { getAllPaths, getPathById, getPathByTopic } from "../controllers/learningPathController.js";

const router = express.Router();

router.get("/", getAllPaths);
router.get("/by-topic/:topic", getPathByTopic);
router.get("/:pathId", getPathById);

export default router;
