import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import componentRoutes from "./routes/componentRoutes.js";

const app = express();

app.use(cors({ origin: env.frontendOrigin }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "CircuitCraft API" });
});

app.use("/api/components", componentRoutes);

app.use((error, _req, res, _next) => {
  console.error("[CircuitCraft API]", error.message);
  res.status(error.statusCode || 500).json({
    error: error.message || "Unexpected server error."
  });
});

app.listen(env.port, () => {
  console.log(`CircuitCraft API running at http://localhost:${env.port}`);
});
