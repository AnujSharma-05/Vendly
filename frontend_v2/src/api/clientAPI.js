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

  /**
   * Get a single auction by ID
   * @param {string} auctionId - Auction ID
   * @returns {Promise} Auction data
   */
  getAuction: async (auctionId) => {
    const response = await api.get(`/client/auctions/${auctionId}`);
    return response.data;
  },

  /**
   * Update an auction
   * @param {string} auctionId - Auction ID
   * @param {Object} updateData - Data to update
   * @returns {Promise} Updated auction
   */
  updateAuction: async (auctionId, updateData) => {
    const response = await api.put(`/client/auctions/${auctionId}`, updateData);
    return response.data;
  },

  /**
   * Delete an auction (only scheduled or finished auctions)
   * @param {string} auctionId - Auction ID
   * @returns {Promise} void
   */
  deleteAuction: async (auctionId) => {
    const response = await api.delete(`/client/auctions/${auctionId}`);
    return response.data;
  },
};

export const {
  getProfile,
  getMyAuctions,
  createAuction,
  getAuction,
  updateAuction,
  deleteAuction,
} = clientAPI;
export default clientAPI;
