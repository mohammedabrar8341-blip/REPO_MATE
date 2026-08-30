import express from "express";
import indexRepo from "./lib/indexRepo.js";
import askQuestion from "./lib/askQuestion.js";

const app = express();
app.use(express.json());

app.post("/addRepo", async (req, res) => {
  const { githubURL, gitToken } = req.body;

  const indexedFiles = await indexRepo(githubURL, gitToken);
  res.json({
    message: "Repo indexed successfully",
    files: indexedFiles.map(({ fileName, sourceCode, summary }) => ({
      fileName,
      sourceCode,
      summary,
    })),
  });
});

app.post("/giturl/question", async (req, res) => {
  try {
    const { userQuery } = req.body;

    const { AI_Summary, relevantFiles, quotaExceeded } = await askQuestion(userQuery);

    res.json({
      message: quotaExceeded ? "AI quota exceeded. Showing repository context only." : "query answer generated successfully",
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
