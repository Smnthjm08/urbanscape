import prisma from "../lib/prisma.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { AppError } from "../lib/AppError.js";

/**
 * GET /api/posts
 * Public listing with filtering, search, sorting, and pagination.
 * Accepts optional authentication (guest vs logged-in).
 */
export const getPosts = asyncHandler(async (req, res) => {
  const {
    city,
    type,
    property,
    bedroom,
    minPrice,
    maxPrice,
    search,
    sortBy,
    order,
    page,
    limit,
  } = req.validatedQuery; // parsed & coerced by the validate middleware


  const skip = (page - 1) * limit;

  // Build where clause
  const where = {
    status: "active", // only show active listings publicly
    ...(city && { city }),
    ...(type && { type }),
    ...(property && { property }),
    ...(bedroom !== undefined && { bedroom }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  // Run count and findMany in parallel for efficiency
  const [total, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip,
      take: limit,
      include: {
        user: {
          select: { username: true, avatar: true },
        },
      },
    }),
  ]);

  res.status(200).json({
    success: true,
    data: posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * GET /api/posts/:id
 * Single post with detail, user info, and save status.
 * Uses optional auth — guests see the post, logged-in users also see isSaved.
 */
export const getPost = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId; // may be null for guests

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      postDetail: true,
      user: {
        select: {
          username: true,
          avatar: true,
        },
      },
    },
  });

  if (!post) {
    throw new AppError(404, "Post not found");
  }

  let isSaved = false;
  if (tokenUserId) {
    const saved = await prisma.savedPost.findUnique({
      where: { userId_postId: { userId: tokenUserId, postId: id } },
    });
    isSaved = Boolean(saved);
  }

  res.status(200).json({
    success: true,
    data: { ...post, isSaved },
  });
});

/**
 * POST /api/posts
 * Create a new listing (authenticated).
 */
export const addPost = asyncHandler(async (req, res) => {
  const { postData, postDetail } = req.body;
  const tokenUserId = req.userId;

  const newPost = await prisma.post.create({
    data: {
      ...postData,
      userId: tokenUserId,
      postDetail: {
        create: postDetail,
      },
    },
    include: { postDetail: true },
  });

  res.status(201).json({
    success: true,
    message: "Post created successfully",
    data: newPost,
  });
});

/**
 * PUT /api/posts/:id
 * Update an existing listing (owner only).
 */
export const updatePost = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { postData, postDetail } = req.body;

  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) {
    throw new AppError(404, "Post not found");
  }

  if (post.userId !== tokenUserId) {
    throw new AppError(403, "Not Authorized!");
  }

  const updatedPost = await prisma.post.update({
    where: { id },
    data: {
      ...postData,
      ...(postDetail && {
        postDetail: {
          upsert: { create: postDetail, update: postDetail },
        },
      }),
    },
    include: { postDetail: true },
  });

  res.status(200).json({
    success: true,
    message: "Post updated successfully",
    data: updatedPost,
  });
});

/**
 * DELETE /api/posts/:id
 * Delete a listing (owner only).
 */
export const deletePost = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) {
    throw new AppError(404, "Post not found");
  }

  if (post.userId !== tokenUserId) {
    throw new AppError(403, "Not Authorized!");
  }

  await prisma.post.delete({ where: { id } });

  res.status(200).json({
    success: true,
    message: "Post deleted successfully",
  });
});
