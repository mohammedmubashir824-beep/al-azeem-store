const jwt = require("jsonwebtoken");

function getSecret() {
  return process.env.JWT_SECRET || "dev_secret_change_me";
}

function signToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: "30d" });
}

function readToken(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, getSecret());
  } catch (err) {
    return null;
  }
}

// Requires a valid admin token
function requireAdmin(req, res, next) {
  const decoded = readToken(req);
  if (!decoded || decoded.role !== "admin") {
    return res.status(401).json({ error: "Please log in as admin to continue." });
  }
  req.admin = decoded;
  next();
}

// Requires a valid customer token
function requireCustomer(req, res, next) {
  const decoded = readToken(req);
  if (!decoded || decoded.role !== "customer") {
    return res.status(401).json({ error: "Please log in to continue." });
  }
  req.customer = decoded;
  next();
}

module.exports = { signToken, readToken, requireAdmin, requireCustomer };
