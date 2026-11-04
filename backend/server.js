require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const OLLAMA_URL = process.env.OLLAMA_URL;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL;

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "Backend is running",
    model: OLLAMA_MODEL,
  });
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Please provide a valid message",
      });
    }

    const ollamaResponse = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      throw new Error(errorText);
    }

    const data = await ollamaResponse.json();

    res.json({
      reply: data.message.content,
    });
  } catch (error) {
    console.error("Chat error:", error.message);

    res.status(500).json({
      error: "Failed to get a response from Ollama",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
