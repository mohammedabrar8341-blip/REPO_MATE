import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { repoAPI } from "../services/api";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("index");
  const [indexData, setIndexData] = useState({
    githubURL: "",
    gitToken: "",
  });
  const [queryData, setQueryData] = useState({
    userQuery: "",
  });
  const [repositories, setRepositories] = useState([]);
  const [indexedFiles, setIndexedFiles] = useState([]);
  const [openFileIndex, setOpenFileIndex] = useState(null);
  const [openQueryFileIndex, setOpenQueryFileIndex] = useState(null);
  const [queryResults, setQueryResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const handleIndexRepo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!indexData.githubURL) {
      setError("GitHub URL is required");
      setLoading(false);
      return;
    }

    try {
      const response = await repoAPI.addRepo({
        githubURL: indexData.githubURL,
        gitToken: indexData.gitToken,
      });

      if (response.data.message === "Repo indexed successfully") {
        setSuccess("Repository indexed successfully!");
        setIndexedFiles(response.data.files || []);
        setOpenFileIndex(null);
        setRepositories([
          ...repositories,
          {
            url: indexData.githubURL,
            files: response.data.files || [],
          },
        ]);
        setIndexData({ githubURL: "", gitToken: "" });
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to index repository";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!queryData.userQuery) {
      setError("Please enter a query");
      setLoading(false);
      return;
    }

    if (repositories.length === 0) {
      setError("Please index a repository first");
      setLoading(false);
      return;
    }

    try {
      const response = await repoAPI.askQuestion({
        userQuery: queryData.userQuery,
      });

      if (response.status === 200) {
        setQueryResults({
          summary: response.data.AI_Summary,
          files: response.data.relevantFiles || [],
          quotaExceeded: response.data.quotaExceeded,
        });
        setOpenQueryFileIndex(null);
        setSuccess("Query processed successfully!");
        setQueryData({ userQuery: "" });
      }
    } catch (err) {
      const message = err.response?.data?.message || "Failed to process query";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      {/* Header/Navbar */}
      <nav className="navbar">
        <div className="navbar-brand">
          <h2>🔍 RepoMate</h2>
        </div>
        <div className="navbar-user">
          <span>Welcome, {user?.username}!</span>
          <button className="profile-btn" onClick={() => navigate("/profile")}>
            👤 Profile
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </nav>

      <div className="home-content">
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === "index" ? "active" : ""}`}
            onClick={() => setActiveTab("index")}
          >
            📑 Index Repository
          </button>
          <button
            className={`tab-btn ${activeTab === "query" ? "active" : ""}`}
            onClick={() => setActiveTab("query")}
          >
            ❓ Ask Question
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">{success}</div>}

        {/* Index Repository Tab */}
        {activeTab === "index" && (
          <div className="tab-content">
            <h3>Index GitHub Repository</h3>
            <p className="tab-description">
              Add a GitHub repository to index and analyze its code
            </p>

            <form onSubmit={handleIndexRepo} className="form">
              <div className="form-group">
                <label>GitHub Repository URL</label>
                <input
                  type="text"
                  value={indexData.githubURL}
                  onChange={(e) =>
                    setIndexData({ ...indexData, githubURL: e.target.value })
                  }
                  placeholder="https://github.com/username/repository"
                  required
                />
              </div>

              <div className="form-group">
                <label>GitHub Access Token (Optional)</label>
                <input
                  type="password"
                  value={indexData.gitToken}
                  onChange={(e) =>
                    setIndexData({ ...indexData, gitToken: e.target.value })
                  }
                  placeholder="Your GitHub token for higher rate limits"
                />
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? "Indexing..." : "Index Repository"}
              </button>
            </form>

            {/* Indexed Files */}
            {indexedFiles.length > 0 && (
              <div className="files-section">
                <h4>📄 Indexed Files ({indexedFiles.length})</h4>
                <div className="files-list">
                  {indexedFiles.map((file, index) => (
                    <article key={index} className={`file-item ${openFileIndex === index ? "is-open" : ""}`}>
                      <button
                        type="button"
                        className="file-toggle"
                        aria-expanded={openFileIndex === index}
                        onClick={() => setOpenFileIndex(openFileIndex === index ? null : index)}
                      >
                        <span className="file-name">{file.fileName}</span>
                        <span className="file-toggle-icon" aria-hidden="true">
                          {openFileIndex === index ? "−" : "+"}
                        </span>
                      </button>
                      {openFileIndex === index && (
                        <div className="file-details">
                          <div className="file-code-heading">Source code</div>
                          <pre className="file-code">
                            {file.sourceCode || "No source code was returned for this file."}
                          </pre>
                          <div className="file-code-heading">Summary</div>
                          <p className="file-summary">
                            {file.summary || "No summary was returned for this file."}
                          </p>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Query Tab */}
        {activeTab === "query" && (
          <div className="tab-content">
            <h3>Ask Question About Indexed Repository</h3>
            <p className="tab-description">
              Ask AI-powered questions about your indexed codebase
            </p>

            <form onSubmit={handleQuery} className="form">
              <div className="form-group">
                <label>Your Question</label>
                <textarea
                  value={queryData.userQuery}
                  onChange={(e) =>
                    setQueryData({ ...queryData, userQuery: e.target.value })
                  }
                  placeholder="Ask anything about the repository (e.g., 'What does the main function do?')"
                  rows="5"
                  required
                ></textarea>
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? "Processing..." : "Get Answer"}
              </button>
            </form>

            {/* Query Results */}
            {queryResults && (
              <div className="results-section">
                <h4>🤖 AI Response</h4>
                {queryResults.quotaExceeded && (
                  <div className="warning-banner">
                    ⚠️ AI quota exceeded. Showing repository context only.
                  </div>
                )}
                <div className="ai-summary">{queryResults.summary}</div>

                {queryResults.files.length > 0 && (
                  <div className="relevant-files">
                    <h5>📌 Relevant Files</h5>
                    <div className="files-list">
                      {queryResults.files.map((file, index) => (
                        <article key={index} className={`file-item ${openQueryFileIndex === index ? "is-open" : ""}`}>
                          <button
                            type="button"
                            className="file-toggle"
                            aria-expanded={openQueryFileIndex === index}
                            onClick={() => setOpenQueryFileIndex(openQueryFileIndex === index ? null : index)}
                          >
                            <span className="file-name">{file.fileName}</span>
                            <span className="file-toggle-icon" aria-hidden="true">
                              {openQueryFileIndex === index ? "−" : "+"}
                            </span>
                          </button>
                          {openQueryFileIndex === index && (
                            <div className="file-details">
                              <div className="file-code-heading">Source code</div>
                              <pre className="file-code">
                                {file.sourceCode || "No source code was returned for this file."}
                              </pre>
                              <div className="file-code-heading">Summary</div>
                              <p className="file-summary">
                                {file.fileSummary || file.description || file.summary || "No summary was returned for this file."}
                              </p>
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Repositories Section */}
        {repositories.length > 0 && (
          <div className="repos-section">
            <h4>📚 Your Indexed Repositories</h4>
            <div className="repos-list">
              {repositories.map((repo, index) => (
                <div key={index} className="repo-card">
                  <div className="repo-url">{repo.url}</div>
                  <div className="repo-files">
                    Files indexed: {repo.files.length}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
