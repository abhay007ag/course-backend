import express from "express";
import { getPlatforms, getPlatformBySlug } from "../controllers/platformController.js";

const router = express.Router();

router.get("/", getPlatforms);
router.get("/:slug", getPlatformBySlug);

export default router;
