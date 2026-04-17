import express from "express";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

dotenv.config();

const app = express();
const port = 3000;

// Gemini
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// STATE
let chatHistory = [];
let chunks = [];
let pdfPath = "";

// =========================
// PDF SPLITTER
// =========================
function splitText(text, size = 800) {
  const words = text.split(" ");
  const result = [];

  for (let i = 0; i < words.length; i += size) {
    result.push(words.slice(i, i + size).join(" "));
  }

  return result;
}

// =========================
// SIMILARITY (cosine simple)
// =========================
function similarity(a, b) {
  const setA = new Set(a.toLowerCase().split(" "));
  const setB = new Set(b.toLowerCase().split(" "));

  const intersection = [...setA].filter(x => setB.has(x)).length;
  return intersection / Math.sqrt(setA.size * setB.size);
}

// MULTER
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => cb(null, file.originalname),
});

const upload = multer({ storage });

// HOME
app.get("/", (req, res) => {
  chatHistory = [];
  chunks = [];
  pdfPath = "";

  res.render("index.ejs", {
    chat: [],
    showPdf: false,
    pdfPath: null,
  });
});


// UPLOAD PDF
app.post("/upload", (req, res) => {
  upload.single("pdf")(req, res, async (err) => {
    if (err) {
      return res.render("index.ejs", {
        error: "PDF error",
        chat: [],
        showPdf: false,
      });
    }

    try {
      pdfPath = "/uploads/" + req.file.filename;

      const buffer = fs.readFileSync(req.file.path);
      const data = await pdf(buffer);

      const text = data.text;

      // 🔥 CHUNKING
      chunks = splitText(text, 1200);

      console.log("Chunks created:", chunks.length);

      res.render("index.ejs", {
        chat: [],
        showPdf: true,
        pdfPath,
      });

    } catch (e) {
      console.error(e);
    }
  });
});
// RESET
app.get("/reset", (req, res) => {
  chatHistory = [];
  chunks = [];
  pdfPath = "";

  res.render("index.ejs", {
    chat: [],
    showPdf: false,
    pdfPath: null,
  });
});
// ASK
app.post("/ask", async (req, res) => {
  const question = req.body.question;

  try {
    // 🔥 1. encontrar chunks relevantes
    const scored = chunks.map(chunk => ({
      chunk,
      score: similarity(question, chunk),
    }));

    const topChunks = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(x => x.chunk)
      .join("\n\n");

    // 🔥 2. prompt PRO
    const prompt = `
You are a PDF assistant.

RULES:
- Use ONLY the context below
- If not found, say "I couldn't find it in the document"
- Be precise

CONTEXT:
"""
${topChunks}
"""

QUESTION:
${question}
`;

    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    const answer = response.text;

    chatHistory.push({ role: "user", content: question });
    chatHistory.push({ role: "bot", content: answer });

    res.render("index.ejs", {
      chat: chatHistory,
      showPdf: true,
      pdfPath,
    });

  } catch (error) {
    console.error(error);
  }
});

// =========================
// SERVER
// =========================
app.listen(port, () => {
  console.log("Server running on", port);
});