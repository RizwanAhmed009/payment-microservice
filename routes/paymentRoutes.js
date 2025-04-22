const express = require("express");
const db = require("../db/db.js");
const axios = require("axios");
const router = express.Router();

// Create Payment Endpoint
router.post("/create", async (req, res) => {
  const { user_id, amount, payment_id } = req.body;
// here is the new code suppose
//new changes...............
  if (!user_id || !amount || !payment_id) {
    return res
      .status(400)
      .send("User ID, amount, and payment ID are required.");
  }

  try {
    //calling auth service to check if user is exist
    const userResponse = await axios.get(
      `http://localhost:8080/api/auth/user/${user_id}`
    );
    const user = userResponse.data;
    if (!user) {
      return res.status(404).send("User not found in Auth Service");
    }
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

    const paymentdata = rows[0][0];
    if (!paymentdata) {
      return res.status(404).send("Payment not found.");
    }
// Get user info from Auth service
   const userResponse = await axios.get(`http://localhost:8080/api/auth/user/${paymentdata.user_id}`);
   const user = userResponse.data;
    // res.json(data[0]);
    res.json({
      ...paymentdata,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching payment: " + error.message);
  }
});

module.exports = router;
