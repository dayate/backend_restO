import { Hono } from "hono";
import publicRoutes from "../src/routes";
import { connectDB } from "../src/config/database";
import { requestLogger } from "../src/middleware/requestLogger";
import { errorHandler } from "../src/middleware/errorHandler";

// Initialize app
const app = new Hono();

// Apply request logger middleware to all routes
app.use("*", requestLogger);

// Set global error handler
app.onError(errorHandler);

// Basic route
app.get("/", (c) => {
  return c.text("Hello RestoMenu Backend!");
});

// Register public routes
app.route("/", publicRoutes);

// Define port
const port = parseInt(process.env.PORT || "3000");

// Connect to database when server starts
connectDB().catch(console.error);

// Start server
console.log(`Server is running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
