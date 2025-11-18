import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  addPost,
  getPost,
  getPosts,
  updatePost,
  deletePost,
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/", verifyToken, getPosts);
router.get("/:id", verifyToken, getPost);
router.post("/", verifyToken, addPost);
router.put("/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePost);

export default router;
