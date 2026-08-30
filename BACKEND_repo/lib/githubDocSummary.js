import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.Gemini_API_Key_1;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const summaryModelFallbacks = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-3.6-flash"];

export function buildFallbackSummary(doc) {
  const source = doc?.metadata?.source || "unknown file";
  const pageContent = typeof doc?.pageContent === "string" ? doc.pageContent : "";
  const snippet = pageContent.replace(/\s+/g, " ").trim().slice(0, 180);

  return `This file is ${source}. It contains application code and logic for the repository. AI summary generation was rate-limited, so this is a fallback summary based on the file name and available source content. ${snippet ? `Preview: ${snippet}` : "No readable source content was available."}`;
}

async function generateSummaryWithFallback(systemPrompt, doc) {
  if (!ai) {
    throw new Error("Gemini API key missing.");
  }

  let lastError = null;

  for (const model of summaryModelFallbacks) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: systemPrompt,
      });

      if (response?.text) {
        return response.text;
      }
    } catch (error) {
      lastError = error;
      console.warn(`Summary model ${model} failed for ${doc?.metadata?.source || "unknown file"}: ${error?.message || error}`);
    }
  }

  throw lastError || new Error("No summary model succeeded.");
}

export default async function githubDocSummary(doc) {
  console.log("Summary generating");

  if (!ai) {
    console.warn("Gemini API key missing. Returning fallback summary.");
    return buildFallbackSummary(doc);
  }

  try {
    const code = (doc?.pageContent || "").slice(0, 10000);

    const systemPrompt = `
You are an intelligent senior software engineer who specialises in onboarding junior software engineers onto projects.

You are onboarding a junior software engineer and explaining to them the purpose of the ${doc?.metadata?.source || "unknown file"} file.

Here is the code:
---
${code}
---

Give a summary of no more than 100 words of the code above.
Don't add greetings, boilerplate, or extra information.
Just summarise the code concisely.
`;

    const result = await generateSummaryWithFallback(systemPrompt, doc);
    return result || buildFallbackSummary(doc);
  } catch (error) {
    const message = error?.message || String(error);
    console.warn(`Summary generation failed for ${doc?.metadata?.source || "unknown file"}: ${message}`);
    return buildFallbackSummary(doc);
  }
}

// const result = await githubDocSummary({
//   pageContent:
//     "const express = require('express');\n" +
//     "const bcrypt = require('bcrypt');\n" +
//     "const jwt = require('jsonwebtoken');\n" +
//     "const { validateUser } = require('./utils');\n" +
//     "\n" +
//     "const router = express.Router();\n" +
//     "\n" +
//     "router.post('/register', async (req, res) => {\n" +
//     "\n" +
//     "});\n" +
//     "\n" +
//     "router.post('/login', async (req, res) => {\n" +
//     "\n" +
//     "});\n" +
//     "\n" +
//     "module.exports = router;\n",

//   metadata: {
//     source: "auth.js",
//     repository: "https://github.com/ZayeemMohd/taskflowAI",
//     branch: "main",
//   },

//   id: undefined,
// });

// console.log("RESULT:", result);
