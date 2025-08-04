import express from "express";
import cors from "cors";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup API routes
import { setupRoutes } from "./routes";
setupRoutes(app);

// Setup Vite dev server or serve static files
if (process.env.NODE_ENV === "production") {
  serveStatic(app);
} else {
  setupVite(app);
}

app.listen(PORT, "0.0.0.0", () => {
  log(`Server running on port ${PORT}`);
});