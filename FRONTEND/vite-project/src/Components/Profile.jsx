import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate("/home")}>
          ← Back to Home
        </button>
        <h1>User Profile</h1>
      </div>

      <div className="profile-card">
        <div className="profile-section">
          <div className="profile-avatar">
            <span className="avatar-icon">👤</span>
          </div>

          <div className="profile-info">
            <div className="info-group">
              <label>Username</label>
              <div className="info-value">{user?.username}</div>
            </div>

            <div className="info-group">
              <label>Email</label>
              <div className="info-value">{user?.email}</div>
            </div>

            <div className="info-group">
              <label>User ID</label>
              <div className="info-value code">{user?.id}</div>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Logout
          </button>
          <p className="logout-description">
            Click to logout and return to the signin page
          </p>
        </div>

        <div className="profile-footer">
          <p>RepoMate © 2024 - Your GitHub Repository AI Assistant</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
