import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { validate } from "../middleware/validate.js";
import { updateUserSchema, savePostSchema } from "../schemas/user.schema.js";
import {
  deleteUser,
  getUser,
  getUsers,
  getProfilePosts,
  getProfileStats,
  savePost,
  updateUser,
} from "../controllers/user.controller.js";

const router = express.Router();

// Public
router.get("/", getUsers);

// Protected — profile endpoints (must be before /:id to avoid route collision)
router.get("/profile/posts", verifyToken, getProfilePosts);
router.get("/profile/stats", verifyToken, getProfileStats);
router.post("/save", verifyToken, validate(savePostSchema), savePost);

// Protected — user CRUD
router.get("/:id", verifyToken, getUser);
router.put("/:id", verifyToken, validate(updateUserSchema), updateUser);
router.delete("/:id", verifyToken, deleteUser);

export default router;
