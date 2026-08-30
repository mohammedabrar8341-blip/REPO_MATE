import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

function Url() {
  const [githubURL, setGithubURL] = useState("");
  const [gitToken, setGitToken] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [indexed, setIndexed] = useState(false);
  const [summary, setSummary] = useState("");
  const [relevantFiles, setRelevantFiles] = useState([]);
  const [repositoryFiles, setRepositoryFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isIndexing, setIsIndexing] = useState(false);
  const [isAsking, setIsAsking] = useState(false);

  async function handleIndex(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    setIsIndexing(true);

    try {
      const response = await axios.post(`${API_URL}/addRepo`, {
        githubURL,
        gitToken,
      });
      const files = Array.isArray(response.data.files) ? response.data.files : [];
      setRepositoryFiles(files);
      setSelectedFile(files[0] || null);
      setIndexed(files.length > 0);
      setStatus({
        type: files.length > 0 ? "success" : "error",
        message: files.length > 0
          ? `${files.length} file${files.length === 1 ? "" : "s"} indexed and ready to explore.`
          : "The repository was indexed, but no readable files were found.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Could not index this repository. Check the server and URL.",
      });
    } finally {
      setIsIndexing(false);
    }
  }

  async function handleQuestion(event) {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    setIsAsking(true);

    try {
      const response = await axios.post(`${API_URL}/giturl/question`, {
        userQuery,
      });
      const data = response.data;
      const isQuotaExceeded = Boolean(data.quotaExceeded);

      setSummary(
        isQuotaExceeded ? "" : (data.AI_Summary || "No summary was returned for this question."),
      );
      setRelevantFiles(
        Array.isArray(data.relevantFiles) ? data.relevantFiles : [],
      );

      if (isQuotaExceeded) {
        setStatus({
          type: "warning",
          message: "AI quota exceeded. Repository context is available, but a fresh answer could not be generated.",
        });
      } else {
        setStatus({ type: "success", message: "Answer generated." });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Could not generate an answer. Try again in a moment.",
      });
    } finally {
      setIsAsking(false);
    }
  }

  return (
    <main className="workspace-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">R</span>
          <span>RepoMate</span>
        </div>
        <span className="connection">
          <span className="connection-dot" /> Local workspace
        </span>
      </header>

      <section className="intro">
        <p className="eyebrow">CODEBASE INTELLIGENCE</p>
        <h1>
          Understand any repository.
          <br />
          <em>One question at a time.</em>
        </h1>
        <p className="intro-copy">
          Index a GitHub repository, then ask questions in plain language.
          RepoMate finds the relevant code and explains how it fits together.
        </p>
      </section>

      <section className="workspace-grid">
        <div className="workflow-column">
          <form className="panel" onSubmit={handleIndex}>
            <div className="panel-heading">
              <span className="step-number">01</span>
              <div>
                <h2>Connect repository</h2>
                <p>Give RepoMate a codebase to study.</p>
              </div>
            </div>
            <label htmlFor="github-url">GitHub repository URL</label>
            <input
              id="github-url"
              type="url"
              placeholder="https://github.com/owner/repository"
              value={githubURL}
              onChange={(event) => setGithubURL(event.target.value)}
              required
            />
            <label htmlFor="git-token">
              Personal access token <span>optional for public repos</span>
            </label>
            <input
              id="git-token"
              type="password"
              placeholder="ghp_..."
              value={gitToken}
              onChange={(event) => setGitToken(event.target.value)}
            />
            <button
              className="primary-button"
              type="submit"
              disabled={isIndexing}
            >
              {isIndexing
                ? "Indexing repository..."
                : indexed
                  ? "Re-index repository"
                  : "Index repository"}{" "}
              <span>→</span>
            </button>
          </form>

          <form
            className={`panel question-panel ${!indexed ? "is-locked" : ""}`}
            onSubmit={handleQuestion}
          >
            <div className="panel-heading">
              <span className="step-number">02</span>
              <div>
                <h2>Ask your codebase</h2>
                <p>
                  {indexed
                    ? "Ask anything about the indexed repository."
                    : "Index a repository to unlock questions."}
                </p>
              </div>
            </div>
            <label htmlFor="user-query">Your question</label>
            <textarea
              id="user-query"
              rows="5"
              placeholder="Explain the authentication flow..."
              value={userQuery}
              onChange={(event) => setUserQuery(event.target.value)}
              disabled={!indexed}
              required
            />
            <button
              className="secondary-button"
              type="submit"
              disabled={!indexed || isAsking}
            >
              {isAsking ? "Reading the codebase..." : "Generate answer"}{" "}
              <span>↗</span>
            </button>
          </form>
        </div>

        <section className="results-panel" aria-live="polite">
          <div className="results-header">
            <div>
              <p className="eyebrow">RESPONSE</p>
              <h2>Repository insight</h2>
            </div>
            <span className="spark">✦</span>
          </div>
          {status.message && (
            status.type === "warning" ? (
              <div className="warning-banner">
                <div>
                  <strong>Quota warning</strong>
                  <span>{status.message}</span>
                </div>
                <button type="button" onClick={() => setGithubURL(githubURL)}>
                  Retry later
                </button>
              </div>
            ) : (
              <p className={`status ${status.type}`}>{status.message}</p>
            )
          )}
          {!status.message && !summary && repositoryFiles.length === 0 && (
            <div className="empty-state">
              <div className="empty-symbol">✦</div>
              <h3>Your answer will appear here</h3>
              <p>Index a repository and ask a question to explore the codebase.</p>
            </div>
          )}
          {repositoryFiles.length > 0 ? (
            <div className="code-viewer">
              {selectedFile && (
                <>
                  <div className="code-viewer-header">
                    <strong>{selectedFile.fileName}</strong>
                    <span>{repositoryFiles.length} files</span>
                  </div>
                  <pre>
                    {selectedFile.sourceCode || "No source code was returned for this file."}
                  </pre>
                </>
              )}

              <div className="files-heading repository-files-heading">
                <h3>Repository files</h3>
                <span>{selectedFile ? "Select a file to inspect" : "Indexed"}</span>
              </div>
              <div className="repository-file-list">
                {repositoryFiles.map((file, index) => (
                  <button
                    className={`file-tab ${selectedFile === file ? "selected" : ""}`}
                    key={`${file.fileName}-${index}`}
                    type="button"
                    onClick={() => setSelectedFile(file)}
                  >
                    <span>{file.fileName}</span>
                    <small>view code</small>
                  </button>
                ))}
              </div>

              {summary && (
                <div className="answer-after-code">
                  <div className="files-heading">
                    <h3>Latest answer</h3>
                    <span>AI summary</span>
                  </div>
                  <div className="answer-card">
                    <p>{summary}</p>
                  </div>
                </div>
              )}
            </div>
          ) : summary ? (
            <>
              <div className="answer-card summary-card">
                <p>{summary}</p>
              </div>
              <div className="files-heading">
                <h3>Relevant files</h3>
                <span>{relevantFiles.length} found</span>
              </div>
              <div className="file-list">
                {relevantFiles.length ? (
                  relevantFiles.map((file, index) => (
                    <article
                      className="file-item"
                      key={`${file.fileName || file.path || index}-${index}`}
                    >
                      <div className="file-icon">
                        {(file.fileName || file.path || "")
                          .split(".")
                          .pop()
                          ?.toUpperCase()
                          .slice(0, 3) || "FILE"}
                      </div>
                      <div>
                        <strong>
                          {file.fileName || file.path || "Unnamed file"}
                        </strong>
                        <p>
                          {file.sourceCode ||
                            file.description ||
                            "Relevant source identified by RepoMate."}
                        </p>
                      </div>
                      <span className="file-score">
                        {file.similarityScore
                          ? `${Math.round(file.similarityScore * 100)}%`
                          : "match"}
                      </span>
                    </article>
                  ))
                ) : (
                  <p className="empty-copy">No relevant files were returned.</p>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-symbol">⌁</div>
              <h3>Your answer will appear here</h3>
              <p>
                Connect a repository and ask a question to see a concise
                explanation with the source files that matter.
              </p>
            </div>
          )}
        </section>
      </section>
      <footer>
        <span>RepoMate / AI-assisted code navigation</span>
        <span>API: {API_URL}</span>
      </footer>
    </main>
  );
}

export default Url;
