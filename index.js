const express = require("express");
const app = express();
const paymentRoutes = require("./routes/paymentRoutes.js"); 

app.use(express.json()); // For parsing application/json

app.use("/", paymentRoutes);

app.use((req, res, next) => {
  res.status(404).send("Route not found");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
