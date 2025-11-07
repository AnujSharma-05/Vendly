import api from "./axios";

/**
 * Admin API Service
 * Handles admin-specific operations like client approvals
 */

const adminAPI = {
  /**
   * Get all pending client profiles awaiting approval
   * @returns {Promise} Array of pending client profiles
   */
  getPendingClients: async () => {
    const response = await api.get("/admin/clients/pending");
    return response.data;
  },

  /**
   * Approve a client profile
   * @param {string} userId - User ID of the client to approve
   * @returns {Promise} Updated client profile
   */
  approveClient: async (userId) => {
    const response = await api.post(`/admin/clients/${userId}/approve`);
    return response.data;
  },

  /**
   * Reject a client profile
   * @param {string} userId - User ID of the client to reject
   * @returns {Promise} Updated client profile
   */
  rejectClient: async (userId) => {
    const response = await api.post(`/admin/clients/${userId}/reject`);
    return response.data;
  },
};

export default adminAPI;
