import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.Gemini_API_Key_Query_1 ||
    process.env.Gemini_API_Key_Query_0 ||
    process.env.Gemini_API_Key_Query;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;


export default async function embedQuery(userQuery) {
    console.log("Generating embedding for query...");

    if (!ai) {
        throw new Error("Gemini query embedding API key missing.");
    }

    const response = await ai.models.embedContent({
        model: "gemini-embedding-2",
        contents: [userQuery],
    });

    return response.embeddings[0].values;
}

// let queryEmbed= await embedQuery("PDF releted code ?")
// console.log(queryEmbed);
