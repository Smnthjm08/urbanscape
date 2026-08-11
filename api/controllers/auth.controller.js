import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { AppError } from "../lib/AppError.js";

export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });

  // Prisma P2002 (unique violation) is handled by the global errorHandler

  const { password: _, ...userInfo } = newUser;
  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: userInfo,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Check if the user exists
  const user = await prisma.user.findUnique({
    where: { username },
  });
  if (!user) {
    throw new AppError(400, "Invalid Credentials!");
  }

  // Check if the password is correct
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(400, "Invalid Credentials!");
  }

  // Generate cookie token and send to the user
  const age = 1000 * 60 * 60 * 24 * 7; // 7 days in ms

  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET_KEY,
    // jsonwebtoken expects seconds, the cookie maxAge below expects ms
    { expiresIn: age / 1000 }
  );

  const { password: _, ...userInfo } = user;

  res
    .cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: age,
    })
    .status(200)
    .json({
      success: true,
      message: "Login successful",
      data: userInfo,
    });
});

export const logout = (_req, res) => {
  res
    .clearCookie("token")
    .status(200)
    .json({ success: true, message: "Logout Successful" });
};
