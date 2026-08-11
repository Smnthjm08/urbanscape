import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import { asyncHandler } from "../lib/asyncHandler.js";
import { AppError } from "../lib/AppError.js";

/**
 * GET /api/users
 * List all users (admin/public — passwords omitted).
 */
export const getUsers = asyncHandler(async (_req, res) => {
  const users = await prisma.user.findMany({ omit: { password: true } });
  res.status(200).json({ success: true, data: users });
});

/**
 * GET /api/users/:id
 * Get a single user by ID (password omitted).
 */
export const getUser = asyncHandler(async (req, res) => {
  const id = req.params.id;

  const user = await prisma.user.findUnique({
    where: { id },
    omit: { password: true },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  res.status(200).json({ success: true, data: user });
});

/**
 * PUT /api/users/:id
 * Update user profile (self only).
 */
export const updateUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { password, avatar, ...inputs } = req.body;

  if (id !== tokenUserId) {
    throw new AppError(403, "Not Authorized!");
  }

  let updatedPassword = null;
  if (password) {
    updatedPassword = await bcrypt.hash(password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      ...inputs,
      ...(updatedPassword && { password: updatedPassword }),
      ...(avatar !== undefined && { avatar }),
    },
    omit: { password: true },
  });

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: updatedUser,
  });
});

/**
 * POST /api/users/save
 * Toggle save/unsave a post for the current user.
 */
export const savePost = asyncHandler(async (req, res) => {
  const { postId } = req.body;
  const tokenUserId = req.userId;

  const saved = await prisma.savedPost.findUnique({
    where: { userId_postId: { userId: tokenUserId, postId } },
  });

  if (saved) {
    await prisma.savedPost.delete({ where: { id: saved.id } });
    return res.status(200).json({
      success: true,
      message: "Post removed from saved list",
    });
  }

  await prisma.savedPost.create({
    data: { userId: tokenUserId, postId },
  });

  res.status(200).json({
    success: true,
    message: "Post saved",
  });
});

/**
 * DELETE /api/users/:id
 * Delete user account (self only).
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  if (id !== tokenUserId) {
    throw new AppError(403, "Not Authorized!");
  }

  await prisma.user.delete({ where: { id } });

  res
    .clearCookie("token")
    .status(200)
    .json({ success: true, message: "User deleted successfully" });
});

/**
 * GET /api/users/profile/posts
 * Get the logged-in user's own listings + their saved posts.
 */
export const getProfilePosts = asyncHandler(async (req, res) => {
  const tokenUserId = req.userId;

  const [myPosts, savedPosts] = await Promise.all([
    prisma.post.findMany({
      where: { userId: tokenUserId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.savedPost.findMany({
      where: { userId: tokenUserId },
      include: {
        post: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      myPosts,
      savedPosts: savedPosts.map((sp) => sp.post),
    },
  });
});

/**
 * GET /api/users/profile/stats
 * Get profile statistics for the logged-in user.
 */
export const getProfileStats = asyncHandler(async (req, res) => {
  const tokenUserId = req.userId;

  const [totalListings, activeListings, savedCount] = await Promise.all([
    prisma.post.count({ where: { userId: tokenUserId } }),
    prisma.post.count({ where: { userId: tokenUserId, status: "active" } }),
    prisma.savedPost.count({ where: { userId: tokenUserId } }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalListings,
      activeListings,
      savedCount,
    },
  });
});
