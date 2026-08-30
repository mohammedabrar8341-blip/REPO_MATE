import {GithubRepoLoader } from "@langchain/community/document_loaders/web/github"
import dotenv from "dotenv"

dotenv.config()


export default async function loadGitHub(githubURL,githubToken) {
    const load= new GithubRepoLoader(githubURL,{
        recursive:true,

        //adding api key
        accessToken:githubToken || process.env.GITHUB_ACCESS_TOKEN,
        ignoreFiles:[
             ".gitignore",
      "node_modules/**",
      "dist/**",
      "build/**",
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
        ]
    })

    const docsArr= await load.load()
    // console.log(docsArr);

    return docsArr
    
}

// loadGitHub("https://github.com/ZayeemMohd/taskflowAI")