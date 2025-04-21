const express = require("express");
const db = require('../db/db.js'); 

const router = express.Router();

// Create Payment Endpoint
router.post("/create", async (req, res) => {
  const { user_id, amount, payment_id } = req.body;

  if (!user_id || !amount || !payment_id) {
    return res
      .status(400)
      .send("User ID, amount, and payment ID are required.");
  }

  try {
    // Call stored procedure
    const [result] = await db.query("CALL InsertPayment(?, ?, ?)", [
      user_id,
      amount,
      payment_id,
    ]);

    res.status(201).json({
      id: result?.insertId || null, // insertId may not be available with CALL
      user_id,
      amount,
      payment_id,
      status: "pending",
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating payment: " + error.message);
  }
});

// Get Payment Details by payment_id
router.get("/:payment_id", async (req, res) => {
  const { payment_id } = req.params;

  if (!payment_id) {
    return res.status(400).send("Payment ID is required.");
  }

  try {
    const [rows] = await db.query("CALL getPaymentById(?)", [payment_id]);

    const data = rows[0];
    if (data.length === 0) {
      return res.status(404).send("Payment not found.");
    }

    res.json(data[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching payment: " + error.message);
  }
});

module.exports = router;
