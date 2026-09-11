import queryCodebase from "./queryCodebase.js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const generationKeys = [
  ["Gemini_API_Key_Query_2", process.env.Gemini_API_Key_Query_2],
  ["Gemini_API_Key_Query_1", process.env.Gemini_API_Key_Query_1],
  ["Gemini_API_Key_Query_0", process.env.Gemini_API_Key_Query_0],
  ["Gemini_API_Key_3", process.env.Gemini_API_Key_3],
].filter(([, key]) => key);
const MODEL = "gemini-3.6-flash";

function isQuotaError(error) {
  const message = error?.message || String(error);
  const lowerMessage = message.toLowerCase();

  return (
    error?.status === 429 ||
    error?.code === 429 ||
    lowerMessage.includes("429") ||
    lowerMessage.includes("resource_exhausted") ||
    lowerMessage.includes("quota")
  );
}

export function buildFallbackAnswer(userQuery, relevantFiles = []) {
  const safeFiles = relevantFiles.length ? relevantFiles : [];

  if (!safeFiles.length) {
    return `I could not generate a fresh answer for "${userQuery}" because the AI service is currently rate-limited. No matching repository files were found for this query yet, so please try again after the quota resets or re-index the repo.`;
  }

  const topMatches = safeFiles.slice(0, 3).map((file, index) => {
    const summary = file.fileSummary || file.summary || "No summary available.";
    return `File ${index + 1}: ${file.fileName}\n${summary}`;
  }).join("\n\n");

  return `I could not generate a fresh AI answer for "${userQuery}" because the Gemini API is currently rate-limited. Based on the indexed code, here is the most relevant context:\n\n${topMatches}\n\nPlease try again in a moment or re-index the repository once the quota resets.`;
}

async function generateAnswerWithFallback(systemPrompt) {
  if (!generationKeys.length) {
    throw new Error("Gemini API key missing.");
  }

  let lastError = null;

  for (const [keyName, apiKey] of generationKeys) {
    try {
      console.log(`Trying Gemini using ${keyName}...`);
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: systemPrompt,
      });

      if (response?.text) {
        console.log(`Gemini succeeded using ${keyName}`);
        return response.text;
      }

      throw new Error("Gemini returned an empty response.");
    } catch (error) {
      lastError = error;
      console.warn(`Gemini failed using ${keyName}: ${error?.message || error}`);

      if (isQuotaError(error)) {
        throw error;
      }
    }
  }

  throw lastError || new Error("No question model succeeded.");
}

export default async function askQuestion(userQuery, userId) {
  let relevantFiles = [];

  try {
    relevantFiles = await queryCodebase(userQuery, userId);
  } catch (error) {
    const message = error?.message || String(error);
    console.warn(`Codebase query failed: ${message}`);

    return {
      AI_Summary: buildFallbackAnswer(userQuery, relevantFiles),
      relevantFiles,
      quotaExceeded: isQuotaError(error),
    };
  }

  if (!generationKeys.length) {
    return {
      AI_Summary: buildFallbackAnswer(userQuery, relevantFiles),
      relevantFiles,
      quotaExceeded: false,
    };
  }

  if (!relevantFiles.length) {
    return {
      AI_Summary: `I could not find relevant files in the indexed codebase for "${userQuery}".`,
      relevantFiles,
      quotaExceeded: false,
    };
  }

  try {
    const context = relevantFiles
      .map(
        (fileObj, index) =>
          `File ${index + 1}: ${fileObj.fileName},\nSummary of File: ${fileObj.fileSummary},\nCode Content: ${fileObj.sourceCode}`
      )
      .join("\n\n");

    const systemPrompt = [
      `You are a ai code assistant who answers questions about the codebase. Your target audience is a technical intern who is looking to understand the codebase.
      AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
        AI is a well-behaved and well-mannered individual.
        AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
        AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
        If the question is asking about code or a specific file, AI will provide the detailed answer, giving step by step instructions, including code snippets.
        START CONTEXT BLOCK
        ${context}
        END OF CONTEXT BLOCK

        START QUESTION
        ${userQuery}
        END OF QUESTION
        AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
        If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
        AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
        AI assistant will not invent anything that is not drawn directly from the context.
        Answer in markdown syntax, with code snippets if needed. Be as detailed as possible when answering, make sure there is no ambiguity and include any and all relevant information to give context to the intern.
              `,
    ];

    const answer = await generateAnswerWithFallback(systemPrompt);

    return {
      AI_Summary: answer || buildFallbackAnswer(userQuery, relevantFiles),
      relevantFiles,
      quotaExceeded: false,
    };
  } catch (error) {
    const message = error?.message || String(error);
    console.warn(`Question generation failed: ${message}`);

    return {
      AI_Summary: buildFallbackAnswer(userQuery, relevantFiles),
      relevantFiles,
      quotaExceeded: isQuotaError(error),
    };
  }
}

// askQuestion("where pdf variable is called?");
