import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const queryKeys = [
    ["Gemini_API_Key_Query_2", process.env.Gemini_API_Key_Query_2],
    ["Gemini_API_Key_Query_1", process.env.Gemini_API_Key_Query_1],
    ["Gemini_API_Key_Query_0", process.env.Gemini_API_Key_Query_0],
    ["Gemini_API_Key_Query", process.env.Gemini_API_Key_Query],
].filter(([, key]) => key);


export default async function embedQuery(userQuery) {
    console.log("Generating embedding for query...");

    if (!queryKeys.length) {
        throw new Error("Gemini query embedding API key missing.");
    }

    let lastError = null;

    for (const [keyName, apiKey] of queryKeys) {
        try {
            console.log(`Trying query embedding using ${keyName}...`);
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.embedContent({
                model: "gemini-embedding-2",
                contents: [userQuery],
            });

            if (response?.embeddings?.[0]?.values) {
                return response.embeddings[0].values;
            }

            throw new Error("Gemini returned an empty query embedding.");
        } catch (error) {
            lastError = error;
            console.warn(`Query embedding failed using ${keyName}: ${error?.message || error}`);
        }
    }

    throw lastError || new Error("No Gemini query embedding key succeeded.");
}

// let queryEmbed= await embedQuery("PDF releted code ?")
// console.log(queryEmbed);
