import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  signup: (data) => api.post("/auth/signup", data),
  signin: (data) => api.post("/auth/signin", data),
};

export const repoAPI = {
  addRepo: (data) => api.post("/protected/addRepo", data),
  streamRepo: (data, onEvent) => {
    const token = localStorage.getItem("token");
    return fetch(`${API_BASE_URL}/protected/addRepo/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    }).then(async (response) => {
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Could not index the repository.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const rawEvent of events) {
          const eventName = rawEvent.match(/^event: (.+)$/m)?.[1];
          const eventData = rawEvent.match(/^data: (.+)$/m)?.[1];
          if (eventName && eventData) onEvent(eventName, JSON.parse(eventData));
        }
      }
    });
  },
  askQuestion: (data) => api.post("/protected/giturl/question", data),
};

export default api;
