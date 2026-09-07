import fs from "fs/promises";
import { Connection } from "./db.js";
import { repositoryModel } from "./Models.js";

export default async function loadCodebaseEmbeddings(userId) {
  console.log("fetching codebase embeddings....");

  if (userId && process.env.MONO_DB) {
    await Connection();
    const repository = await repositoryModel.findOne({ userId }).sort({ updatedAt: -1 }).lean();
    if (repository?.indexedFiles?.length) {
      return repository.indexedFiles;
    }
  }

  const data = await fs.readFile("embedding.json", "utf-8");
  return JSON.parse(data);
}

// loadCodebaseEmbeddings()