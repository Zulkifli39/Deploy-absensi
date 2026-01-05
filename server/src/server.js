import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import os from "os";

// ✅ Import loadModels
import { loadModels } from "./utils/faceRecognition.js";

import authRoutes from "./routes/authRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import subDepartmentRoutes from "./routes/subDepartmentRoutes.js";
import userRoutesNew from "./routes/userRoutesNew.js";
import userFaceRoutes from "./routes/userFaceRoutes.js";
import informationRoutes from "./routes/informationRoutes.js";
import employeeStatusRoutes from "./routes/employeeStatusRoutes.js";
import userRoleRoutes from "./routes/userRoleRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import schedulePeriods from "./routes/schedulePeriodRoutes.js";
import userShiftSchedules from "./routes/userShiftScheduleRoutes.js";
import attendanceReportRoutes from "./routes/attendanceReportRoutes.js";
import overtimeRoutes from "./routes/overtimeRoutes.js";

dotenv.config();

const app = express();

// CORS
app.use(cors());
// app.use(cors({ origin: "*" }));

// Body parsing with 10MB limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutesNew);
app.use("/api/user-faces", userFaceRoutes);
app.use("/api/employee-status", employeeStatusRoutes);
app.use("/api/user-roles", userRoleRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/sub-departments", subDepartmentRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/information", informationRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/check-location", attendanceRoutes);
app.use("/api/schedule-periods", schedulePeriods);
app.use("/api/user-shift-schedules", userShiftSchedules);
app.use("/api/reports", attendanceReportRoutes);
app.use("/api/overtime", overtimeRoutes);

app.get("/", (req, res) => {
  res.send("Server berjalan!");
});

// ✅ Start server dengan load models dulu
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    console.log("\n╔════════════════════════════════════╗");
    console.log("║   🚀 STARTING SERVER...           ║");
    console.log("╚════════════════════════════════════╝\n");

    // ✅ Load face-api models SEBELUM server listen
    console.log("📦 Loading face-api models...");
    await loadModels();
    console.log("✅ Face-api models loaded successfully!\n");

    // Start server
    app.listen(PORT, () => {
      // Get local IP address
      const interfaces = os.networkInterfaces();
      const addresses = [];
      for (const k in interfaces) {
        for (const k2 in interfaces[k]) {
          const address = interfaces[k][k2];
          if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
          }
        }
      }

      console.log("╔════════════════════════════════════╗");
      console.log(`║   ✅ SERVER RUNNING ON PORT ${PORT}   ║`);
      console.log("╚════════════════════════════════════╝\n");
      console.log(`📍 Local Access:   http://localhost:${PORT}`);
      addresses.forEach(addr => {
        console.log(`📍 Network Access: http://${addr}:${PORT}`);
      });
      console.log("\n✅ Ready to accept face registration requests!\n");
    });

  } catch (err) {
    console.error("\n╔════════════════════════════════════╗");
    console.error("║   ❌ FAILED TO START SERVER       ║");
    console.error("╚════════════════════════════════════╝\n");
    console.error(err);
    console.error("\nPlease check:");
    console.error("  1. Models folder exists at: ./models/");
    console.error("  2. Model files are present");
    console.error("  3. face-api.js is installed\n");
    process.exit(1);
  }
};

// ✅ Jalankan start server
startServer();