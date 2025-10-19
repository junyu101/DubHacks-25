import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { useGemini } from "./gemini.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Allow frontend to access backend
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://dub-hacks-25.vercel.app/", // your Vercel site URL
      "dub-hacks-25-mxm55b7tt-junyu101s-projects.vercel.app"
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  })
);

app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "Daydreamer backend is running", timestamp: new Date() });
});

// Main chat endpoint - calls Gemini AI
app.post("/api/chat", async (req, res) => {
  try {
    console.log("[API] POST /api/chat received:", req.body);

    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing 'message' string in request body" });
    }

    // Call Gemini AI
    const { text, mood, rageMeter } = await useGemini(message);

    if (!text) {
      return res.status(502).json({ error: "Empty response from Gemini AI" });
    }

    // Return AI response to frontend
    res.json({
      reply: text,
      mood: mood,
      intensity: rageMeter
    });
  } catch (err) {
    console.error("[API] Error:", err);
    res.status(500).json({ error: "Server error processing your request" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Daydreamer Backend running on port ${PORT}`);
  console.log(`📡 API endpoint: /api/chat`);
});
