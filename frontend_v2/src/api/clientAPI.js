import api from "./axios";

/**
 * Client API Service
 * Handles client-specific operations like profile status and auction management
 */

const clientAPI = {
  /**
   * Get current client's profile status
   * @returns {Promise} Client profile data
   */
  getProfile: async () => {
    const response = await api.get("/client/profile");
    return response.data;
  },

  /**
   * Get client's auctions
   * @returns {Promise} Array of auctions created by the client
   */
  getMyAuctions: async () => {
    const response = await api.get("/client/auctions");
    return response.data;
  },

  /**
   * Create a new auction
   * @param {Object} auctionData - Auction creation data
   * @returns {Promise} Created auction
   */
  createAuction: async (auctionData) => {
    const response = await api.post("/client/auctions", auctionData);
    return response.data;
  },
};

export default clientAPI;
