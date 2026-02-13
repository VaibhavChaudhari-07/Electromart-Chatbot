// server/config/jwtMiddleware.js
const jwt = require("jsonwebtoken");

/**
 * JWT helper and middlewares
 *
 * Required env:
 *   JWT_SECRET - secret used to sign/verify tokens
 *   JWT_EXPIRES_IN - optional expiration like "7d" (defaults to "7d")
 *
 * Exports:
 *  - signToken(payload) -> token string
 *  - authUser middleware -> protects user routes, sets req.user
 *  - authAdmin middleware -> protects admin routes, sets req.admin
 *  - optionalAuth middleware -> if token present attaches req.user/req.admin, otherwise continues
 */

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret_in_production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function signToken(payload) {
  // payload typically { _id, name, email, role? }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function extractTokenFromHeader(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header) return null;
  // Accept formats: "Bearer <token>"
  const parts = header.split(" ");
  if (parts.length === 2 && /^Bearer$/i.test(parts[0])) {
    return parts[1];
  }
  return null;
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/* Middleware to protect user routes */
function authUser(req, res, next) {
  try {
    const token = extractTokenFromHeader(req);
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = verifyToken(token);
    // Optionally check role if present
    // if (decoded.role && decoded.role !== "user") return res.status(403).json({ message: "Not a user token" });

    req.user = decoded; // attach decoded payload (e.g. { _id, email, name, token? })
    next();
  } catch (err) {
    console.error("authUser error:", err.message || err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/* Middleware to protect admin routes */
function authAdmin(req, res, next) {
  try {
    const token = extractTokenFromHeader(req);
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = verifyToken(token);
    // If you want a strict admin check, ensure payload has admin flag/role
    // e.g. if (!decoded.isAdmin) return res.status(403).json({ message: "Admin access required" });

    req.admin = decoded;
    next();
  } catch (err) {
    console.error("authAdmin error:", err.message || err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/* Optional auth - attaches user/admin if token exists, otherwise continues */
function optionalAuth(req, res, next) {
  try {
    const token = extractTokenFromHeader(req);
    if (!token) {
      return next();
    }
    const decoded = verifyToken(token);
    // Attach to user or admin based on presence of isAdmin flag in payload
    if (decoded.isAdmin) req.admin = decoded;
    else req.user = decoded;
    return next();
  } catch (err) {
    // If token invalid, just continue without attaching identity
    return next();
  }
}

/* Required auth - accepts either user or admin token */
function authRequired(req, res, next) {
  try {
    const token = extractTokenFromHeader(req);
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = verifyToken(token);
    // Attach to user or admin based on presence of isAdmin flag in payload
    if (decoded.isAdmin) req.admin = decoded;
    else req.user = decoded;
    return next();
  } catch (err) {
    console.error("authRequired error:", err.message || err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = {
  signToken,
  authUser,
  authAdmin,
  optionalAuth,
  authRequired,
  verifyToken,
};
