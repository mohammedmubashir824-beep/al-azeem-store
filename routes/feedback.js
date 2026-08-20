const express = require("express");
const jwt = require("jsonwebtoken");
const supabase = require("../db/supabase");

const router = express.Router();

// Submit customer feedback
router.post("/", async (req, res) => {
  const { rating, message } = req.body;

  // Validate rating
  const numericRating = Number(rating);

  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: "Please select a rating from 1 to 5 stars." });
  }

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Please enter your feedback." });
  }

  // Get logged-in customer from JWT
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: "Please log in to submit feedback." });
  }

  try {
    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    const decoded = jwt.verify(token, secret);

    if (decoded.role !== "customer") {
      return res.status(401).json({ error: "Invalid customer session." });
    }

    // Save feedback to Supabase
    const { data, error } = await supabase
      .from("feedback")
      .insert({
        customer_id: decoded.id,
        rating: numericRating,
        message: message.trim()
      })
      .select()
      .single();

    if (error) {
      console.error("Feedback insert error:", error);
      return res.status(500).json({ error: "Could not save your feedback. Please try again." });
    }

    res.status(201).json({
      message: "Thank you for your feedback!",
      feedback: data
    });

  } catch (err) {
    console.error("Feedback authentication error:", err.message);
    return res.status(401).json({ error: "Your session has expired. Please log in again." });
  }
});

module.exports = router;