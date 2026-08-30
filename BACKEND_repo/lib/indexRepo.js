import loadGitHub from "./github_loader.js";
import githubDocSummary from "./githubDocSummary.js";
import embedSummary from "./embedSummary.js";
import fs from "fs/promises";

export default async function indexRepo(githubURL, gitToken) {
  console.log("loading/fetching repo ....");

  const docArr = await loadGitHub(githubURL, gitToken);
  console.log("gethub repo fetched ", docArr.length);

  const result = [];

  for (const doc of docArr) {
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

      result.push(docObject);
    } catch (error) {
      const fileName = doc?.metadata?.source || "unknown-file";
      console.warn(`Failed to index ${fileName}: ${error?.message || error}`);

      result.push({
        summary: `This file is ${fileName}. The repository could not be fully summarized due to a quota or AI availability issue, but the source code is still available for inspection.`,
        embeding: new Array(768).fill(0),
        sourceCode: JSON.parse(JSON.stringify(doc?.pageContent || "")),
        fileName,
      });
    }
  }

  await fs.writeFile("embedding.json", JSON.stringify(result, null, 2));
  console.log("✅ Embeddings generated and saved to embeddings.json");

  return result;
}

