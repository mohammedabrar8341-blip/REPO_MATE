import embedQuery from "./embedQuery.js";
import LoadCodebaseEmbeddings from "./loadCodebaseEmbeddings.js";
import cosineSimilarity from "./cosineSimilarity.js";

export default async function queryCodebase(userQuery, userId) {
  //step 1:- Generating embedding for userquery
  const queryEmbedding = await embedQuery(userQuery);
  //[]

  //step 2:-Load codebase embeddings

  const codebaseEmbdding = await LoadCodebaseEmbeddings(userId);
  // [{}, {}, {}];

  // Step3: Generate cosine similarity betwen queryEmbedding and all child of codebaseEmbeddings
//   console.log("codebaseEmbdding:", codebaseEmbdding);
//   console.log("type:", typeof codebaseEmbdding);
//   console.log("is array:", Array.isArray(codebaseEmbdding));

  const resultArr = codebaseEmbdding.map((fileObj) => {
    let similarityScore = cosineSimilarity(queryEmbedding, fileObj.embeding);

      return {
        similarityScore,
        fileName: fileObj.fileName,
        sourceCode: fileObj.sourceCode,
        fileSummary: fileObj.summary,
      };
    })
    .filter(Boolean);

  const sortedResults = resultArr.sort(
    (a, b) => b.similarityScore - a.similarityScore,
  );
  const relevantResults = sortedResults.filter(
    (result) => result.similarityScore > 0.35,
  );

  return (relevantResults.length ? relevantResults : sortedResults.slice(0, 3)).slice(0, 5);
}
