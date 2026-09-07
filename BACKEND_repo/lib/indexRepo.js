import loadGitHub from "./github_loader.js";
import githubDocSummary, { buildFallbackSummary } from "./githubDocSummary.js";
import embedSummary from "./embedSummary.js";
import fs from "fs/promises";
import { Connection } from "./db.js";
import { repositoryModel } from "./Models.js";

export default async function indexRepo(githubURL, gitToken, userId) {
  console.log("loading/fetching repo ....");

  const docArr = await loadGitHub(githubURL, gitToken);
  console.log("gethub repo fetched ", docArr.length);

  const result = await Promise.all(docArr.map(async (doc) => {
    try {
      const docsummary = await githubDocSummary(doc);
      console.log("Step 2 done");

      const docembeding = await embedSummary(docsummary);

      const docObject = {
        summary: docsummary,
        embeding: docembeding,
        sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
        fileName: doc.metadata.source,
      };

      return docObject;
    } catch (error) {
      const fileName = doc?.metadata?.source || "unknown-file";
      console.warn(`Failed to index ${fileName}: ${error?.message || error}`);

      return {
        summary: buildFallbackSummary(doc),
        embeding: new Array(768).fill(0),
        sourceCode: JSON.parse(JSON.stringify(doc?.pageContent || "")),
        fileName,
      };
    }
  }));

  await fs.writeFile("embedding.json", JSON.stringify(result, null, 2));
  console.log("✅ Embeddings generated and saved to embeddings.json");

  if (userId && process.env.MONO_DB) {
    await Connection();
    const repositoryName = githubURL.replace(/\/$/, "").split("/").pop() || githubURL;
    await repositoryModel.findOneAndUpdate(
      { userId, githubURL },
      {
        userId,
        githubURL,
        repositoryName,
        indexedFiles: result,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    console.log("Repository embeddings saved to MongoDB");
  }

  return result;
}

