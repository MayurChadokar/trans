const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

dotenv.config();

const app = express();

// middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

// Request logging (Morgan - very fast)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Concise logs in production to keep it fast
  app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));
}

// test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "development" });
});

app.use("/api/auth", require("./src/routes/auth.routes"));
app.use("/api/uploads", require("./src/routes/upload.routes"));
app.use("/api/admin/auth", require("./src/routes/admin.auth.routes"));
app.use("/api/admin/dashboard", require("./src/routes/admin.dashboard.routes"));
app.use("/api/admin/users", require("./src/routes/admin.users.routes"));
app.use("/api/admin/transport", require("./src/routes/admin.transport.routes"));
app.use("/api/admin/sales", require("./src/routes/admin.sales.routes"));
app.use("/api/admin/garage", require("./src/routes/admin.garage.routes"));
app.use("/api/admin/plans", require("./src/routes/admin.plan.routes"));
app.use("/api/admin/special", require("./src/routes/admin.special.routes"));
app.use("/api/plans", require("./src/routes/plan.routes"));
app.use("/api/transport", require("./src/routes/transport.routes"));

app.use("/api/parties", require("./src/routes/party.routes"));
app.use("/api/bills", require("./src/routes/bill.routes"));
app.use("/api/finance", require("./src/routes/finance.routes"));
app.use("/api/garage", require("./src/routes/garage.routes"));
app.use("/api/garage/vehicles", require("./src/routes/garageVehicle.routes"));
app.use("/api/profile", require("./src/routes/profile.routes"));
app.use("/api/system", require("./src/routes/system.routes"));

// basic error handler
app.use(require("./src/middleware/error.middleware").errorMiddleware);

// mongodb connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error.message);
  });