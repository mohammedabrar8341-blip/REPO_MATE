import {GoogleGenAI} from "@google/genai"
import dotnev from "dotenv"

dotnev.config()

const ai = new GoogleGenAI({
    apiKey :process.env.Gemini_API_Key_Query
})


export default async function embedQuery(userQuery) {
    console.log("Generating embedding for query...");
    const response= await ai.models.embedContent({
        model:"gemini-embedding-2",
        contents:[userQuery]

    })
    return response.embeddings[0].values
}

// let queryEmbed= await embedQuery("PDF releted code ?")
// console.log(queryEmbed);
