import api from "./axios";

/**
 * Authentication API Service
 * Handles login, register, and user profile operations
 */

const authAPI = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.username - Username
   * @param {string} userData.email - Email
   * @param {string} userData.password - Password
   * @param {string} userData.role - User role (participant, client, admin)
   * @returns {Promise} User data
   */
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.username_or_email - Username or email
   * @param {string} credentials.password - Password
   * @returns {Promise} Access token and user data
   */
  login: async (credentials) => {
    // Backend expects form data for OAuth2
    const formData = new URLSearchParams();
    formData.append("username", credentials.username_or_email);
    formData.append("password", credentials.password);

    const response = await api.post("/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  },

  /**
   * Get current user profile
   * @returns {Promise} User profile data
   */
  getCurrentUser: async () => {
    const response = await api.get("/users/me");
    return response.data;
  },

  /**
   * Logout user (client-side only)
   */
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  },
};

export default authAPI;
