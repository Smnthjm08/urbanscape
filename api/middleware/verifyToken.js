import jwt from "jsonwebtoken";

/**
 * Require a valid JWT cookie. Returns 401 when the token is missing or
 * invalid — both mean "we don't know who you are". 403 is reserved for
 * authenticated users who lack permission (editing someone else's listing),
 * so clients can log out on 401 without logging out on a denied action.
 * Sets req.userId on success.
 */
export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not Authenticated!" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
    if (err) {
      return res.status(401).json({ success: false, message: "Token is not valid!" });
    }
    req.userId = payload.id;
    next();
  });
};

/**
 * Optional authentication — if a valid JWT cookie is present, sets
 * req.userId; otherwise continues without error. Useful for routes
 * that behave differently for guests vs logged-in users (e.g. showing
 * whether a listing is saved).
 */
export const verifyTokenOptional = (req, _res, next) => {
  const token = req.cookies.token;

  if (!token) {
    req.userId = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
    req.userId = err ? null : payload.id;
    next();
  });
};
