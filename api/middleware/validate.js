/**
 * Validates a request against a zod schema.
 *
 * Parsed (coerced/trimmed/defaulted) values replace the raw input so
 * controllers never re-parse. Express 5 exposes `req.query` through a
 * getter-only accessor, so query results land on `req.validatedQuery`
 * instead — assigning to `req.query` throws.
 *
 * @param {import("zod").ZodType} schema
 * @param {"body" | "params" | "query"} source
 */
export const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    if (source === "query") {
      req.validatedQuery = result.data;
    } else {
      req[source] = result.data;
    }

    next();
  };
