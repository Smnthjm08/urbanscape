import { ZodError } from "zod";
import { AppError } from "../lib/AppError.js";

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  // If it's an AppError we trust the status & message
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Zod errors normally never reach here (the validate middleware answers
  // them), but a schema parsed inside a controller would land here.
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  // Handle Prisma known-request errors (e.g. unique constraint violations)
  if (err.code === "P2002") {
    const fields = [
      err.meta?.driverAdapterError?.cause?.constraint?.fields ??
        err.meta?.target ??
        [],
    ]
      .flat()
      .join(", ");

    return res.status(409).json({
      success: false,
      message: fields
        ? `Duplicate value for: ${fields}`
        : "A record with that value already exists",
    });
  }

  // Handle Prisma record-not-found errors
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Record not found",
    });
  }

  // Unexpected / programming errors — log and return generic message
  console.error("Unhandled Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
