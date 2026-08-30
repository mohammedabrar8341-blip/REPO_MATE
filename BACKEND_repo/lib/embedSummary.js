import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.Gemini_API_Key_2;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export default async function embedSummary(docSummary) {
  console.log("Generating embeding......");

  if (!ai) {
    console.warn("Gemini embedding API key missing. Falling back to zero vector.");
    return new Array(768).fill(0);
  }

  try {
    const docembedding = await ai.models.embedContent({
      model: "gemini-embedding-2",
      contents: docSummary,
    });
    return docembedding.embeddings[0].values;
  } catch (error) {
    const message = error?.message || String(error);
    console.warn(`Embedding generation failed: ${message}`);
    return new Array(768).fill(0);
  }
}
//  console.log(await embedSummary("This module defines an Express router responsible for handling user authentication endpoints. It imports `bcrypt` for password hashing,`jsonwebtoken` for issuing JWT tokens, and a custom `validateUser` utility for input validation. The file sets up skeleton route handlers for two HTTP POST endpoints: `/register` for creating new user accounts and `/login` for authenticating existing users. Finally, it exports the configured Express router to be mounted in the main application."))