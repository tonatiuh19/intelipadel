import "dotenv/config";
import express from "express";
import handler from "../api/index.js";

const app = express();
const PORT = 3000;

// Mount the Vercel API handler for all /api routes
app.all("/api/*", async (req, res) => {
  await handler(req as any, res as any);
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying API from /api/index.ts`);
});
