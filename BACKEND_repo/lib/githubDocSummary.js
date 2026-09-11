import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.Gemini_API_Key_1;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const summaryModelFallbacks = ["gemini-3.6-flash"];
let summaryQuotaResetAt = 0;

function isQuotaError(error) {
  const message = error?.message || String(error);
  return error?.status === 429 || message.includes("429") || message.includes("RESOURCE_EXHAUSTED");
}

function setSummaryQuotaCooldown(error) {
  const message = error?.message || String(error);
  const retrySeconds = Number(message.match(/retryDelay["']?\s*:\s*["']?(\d+)/i)?.[1]) || 60;
  summaryQuotaResetAt = Date.now() + retrySeconds * 1000;
}

export function buildFallbackSummary(doc) {
  const source = doc?.metadata?.source || "unknown file";
  const pageContent = typeof doc?.pageContent === "string" ? doc.pageContent : "";
  const snippet = pageContent.replace(/\s+/g, " ").trim().slice(0, 700);

  return `File: ${source}\n\nAI summary generation was temporarily unavailable, so this detailed fallback was created from the file name and source code. This file contains repository implementation code and should be read together with its imports, exported functions, and callers to understand its complete role. ${snippet ? `Source overview: ${snippet}` : "No readable source content was available for analysis."}`;
}

async function generateSummaryWithFallback(systemPrompt, doc) {
  if (!ai) {
    throw new Error("Gemini API key missing.");
  }

  if (Date.now() < summaryQuotaResetAt) {
    throw new Error("Gemini summary quota is temporarily unavailable.");
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
      if (isQuotaError(error)) {
        setSummaryQuotaCooldown(error);
      }
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

Give a detailed summary of about 180 to 250 words. Explain the file's main responsibility, important functions or components, inputs and outputs, external libraries or modules it uses, control flow, error handling, and how it contributes to the repository. Mention notable routes, state, data transformations, or UI behavior when they are present.
Use clear paragraphs or short labeled sections. Do not invent behavior that is not visible in the code. Do not add greetings or generic boilerplate.
`;

    const result = await generateSummaryWithFallback(systemPrompt, doc);
    const summary = typeof result === "string" ? result.trim() : "";

    return summary.length >= 80 ? summary : buildFallbackSummary(doc);
  } catch (error) {
    const message = error?.message || String(error);
    if (!message.includes("quota is temporarily unavailable") && !isQuotaError(error)) {
      console.warn(`Summary generation failed for ${doc?.metadata?.source || "unknown file"}: ${message}`);
    }
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
