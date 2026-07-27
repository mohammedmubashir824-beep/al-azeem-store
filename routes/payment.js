const express = require("express");
const crypto = require("crypto");
const supabase = require("../db/supabase");
const { requireCustomer } = require("../middleware/auth");

const router = express.Router();

function getRazorpay() {
  const Razorpay = require("razorpay");
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

// ---- POST /api/payment/create-order - create a Razorpay order for an existing store order ----
router.post("/create-order", requireCustomer, async (req, res) => {
  const { orderId } = req.body;
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("customer_id", req.customer.id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: "Could not load order." });
  if (!order) return res.status(404).json({ error: "Order not found." });

  const razorpay = getRazorpay();
  if (!razorpay) {
    return res.status(503).json({ error: "Online payment is not configured yet. Please choose Cash on Delivery, or ask the shop owner to add Razorpay keys." });
  }

  try {
    const rpOrder = await razorpay.orders.create({
      amount: Math.round(order.total * 100), // paise
      currency: "INR",
      receipt: `order_${order.id}`
    });
    await supabase.from("orders").update({ razorpay_order_id: rpOrder.id }).eq("id", order.id);
    res.json({
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not start online payment. Please try again or choose Cash on Delivery." });
  }
});

// ---- POST /api/payment/verify - verify the payment signature after checkout ----
router.post("/verify", requireCustomer, async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("customer_id", req.customer.id)
    .maybeSingle();
  if (error) return res.status(500).json({ error: "Could not load order." });
  if (!order) return res.status(404).json({ error: "Order not found." });

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return res.status(400).json({ error: "Payment could not be verified." });
  }

  const { data: updated, error: updateError } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      order_status: order.order_status === "placed" ? "confirmed" : order.order_status
    })
    .eq("id", order.id)
    .select()
    .single();

  if (updateError) return res.status(500).json({ error: "Could not update order." });
  res.json({ message: "Payment verified.", order: updated });
});

module.exports = router;
