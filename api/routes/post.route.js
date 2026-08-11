import express from "express";
import { verifyToken, verifyTokenOptional } from "../middleware/verifyToken.js";
import { validate } from "../middleware/validate.js";
import {
  createPostSchema,
  updatePostSchema,
  getPostsQuerySchema,
} from "../schemas/post.schema.js";
import {
  addPost,
  getPost,
  getPosts,
  updatePost,
  deletePost,
} from "../controllers/post.controller.js";

const router = express.Router();

// Public routes (optional auth for save-status awareness)
router.get("/", validate(getPostsQuerySchema, "query"), getPosts);
router.get("/:id", verifyTokenOptional, getPost);

// Protected routes
router.post("/", verifyToken, validate(createPostSchema), addPost);
router.put("/:id", verifyToken, validate(updatePostSchema), updatePost);
router.delete("/:id", verifyToken, deletePost);

export default router;
