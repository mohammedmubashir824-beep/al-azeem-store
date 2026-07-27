const express = require("express");
const supabase = require("../db/supabase");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/summary", requireAdmin, async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { data: orders, error: ordersError } = await supabase.from("orders").select("*");
  if (ordersError) return res.status(500).json({ error: "Could not load orders." });

  const { data: products, error: productsError } = await supabase.from("products").select("*");
  if (productsError) return res.status(500).json({ error: "Could not load products." });

  const { count: totalCustomers, error: customersError } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true });
  if (customersError) return res.status(500).json({ error: "Could not load customers." });

  const todaysOrders = orders.filter((o) => new Date(o.created_at) >= startOfToday && o.order_status !== "cancelled");
  const todaysSales = todaysOrders.reduce((sum, o) => sum + Number(o.total), 0);

  const lowStock = products
    .filter((p) => Number(p.stock_qty) <= Number(p.low_stock_threshold))
    .map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      unit: p.unit,
      stockQty: p.stock_qty,
      lowStockThreshold: p.low_stock_threshold
    }));

  const pendingOrders = orders.filter((o) => ["placed", "confirmed", "packed", "out_for_delivery"].includes(o.order_status));

  res.json({
    todaysOrderCount: todaysOrders.length,
    todaysSales,
    totalProducts: products.length,
    lowStock,
    pendingOrderCount: pendingOrders.length,
    totalCustomers: totalCustomers || 0
  });
});

module.exports = router;
