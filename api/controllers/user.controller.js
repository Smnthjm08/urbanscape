import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({ omit: { password: true } });
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to get Users!",
    });
  }
};

export const getUser = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to get User!",
    });
  }
};

export const updateUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  const { password, avatar, ...inputs } = req.body ?? {};

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }
  let updatedPassword = null;
  try {
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...inputs,
        ...(updatedPassword && { password: updatedPassword }),
        ...(avatar && { avatar }),
      },
    });
    const { password: userPassword, ...rest } = updatedUser;

    res.status(200).json(rest);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to update User!",
    });
  }
};

export const savePost = async (req, res) => {
  const { postId } = req.body ?? {};
  const tokenUserId = req.userId;

  if (!postId) {
    return res.status(400).json({ message: "postId is required" });
  }

  try {
    const saved = await prisma.savedPost.findUnique({
      where: { userId_postId: { userId: tokenUserId, postId } },
    });

    if (saved) {
      await prisma.savedPost.delete({ where: { id: saved.id } });
      return res.status(200).json({ message: "Post removed from saved list" });
    }

    await prisma.savedPost.create({
      data: { userId: tokenUserId, postId },
    });
    res.status(200).json({ message: "Post saved" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to save post!" });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }
  try {
    await prisma.user.delete({
      where: { id },
    });
    res.status(200).json({ message: "User Deleted!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Failed to update User!",
    });
  }
};
