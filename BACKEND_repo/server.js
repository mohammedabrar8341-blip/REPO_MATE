import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import indexRepo from "./lib/indexRepo.js";
import askQuestion from "./lib/askQuestion.js";
import Signup from "./lib/Signup.js";
import Signin from "./lib/Sigin.js";
import { verifyToken } from "./lib/authMiddleware.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Vite default port
    credentials: true,
  })
);

// Auth Routes
app.post("/api/auth/signup", Signup);
app.post("/api/auth/signin", Signin);

// Protected Routes - require authentication
app.use("/api/protected", verifyToken);

app.post("/api/protected/addRepo", async (req, res) => {
  try {
    const { githubURL, gitToken } = req.body || {};
    const userId = req.user.id; // Get user ID from token

    if (!githubURL) {
      return res.status(400).json({ message: "A GitHub repository URL is required." });
    }

    const indexedFiles = await indexRepo(githubURL, gitToken, userId);
    return res.json({
      message: "Repo indexed successfully",
      userId,
      githubURL,
      files: indexedFiles.map(({ fileName, sourceCode, summary }) => ({
        fileName,
        sourceCode,
        summary,
      })),
    });
  } catch (error) {
    const message = error?.message || "Could not index the repository.";
    console.error("Repository indexing failed:", message);

    return res.status(500).json({
      message: `Could not index the repository: ${message}`,
    });
  }
});

app.post("/api/protected/giturl/question", async (req, res) => {
  try {
    const { userQuery } = req.body;
    const userId = req.user.id; // Get user ID from token

    const { AI_Summary, relevantFiles, quotaExceeded } = await askQuestion(userQuery, userId);

    res.json({
      message: quotaExceeded ? "AI quota exceeded. Showing repository context only." : "query answer generated successfully",
      userId,
      AI_Summary,
      relevantFiles,
      quotaExceeded,
    });
  } catch (error) {
    const message = error?.message || "Could not generate an answer. Try again in a moment.";
    console.error("Question request failed:", message);

    res.status(500).json({
      message,
      AI_Summary: "I could not generate a fresh answer because the AI service is unavailable right now. Please try again in a moment.",
      relevantFiles: [],
      quotaExceeded: true,
    });
  }
});

app.listen("8080", () => {
  console.log("server is runnning at port 8080........");
});
