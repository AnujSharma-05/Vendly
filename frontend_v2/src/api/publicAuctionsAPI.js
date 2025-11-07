import api from "./axios";

/**
 * Public Auctions API Service
 * Handles public auction operations (no authentication required)
 */

const publicAuctionsAPI = {
  /**
   * Get all public auctions
   * @param {string} status - Optional filter by status (scheduled, active, finished)
   * @returns {Promise} Array of auctions
   */
  getAuctions: async (status = null) => {
    const params = status ? { status } : {};
    const response = await api.get("/auctions", { params });
    return response.data;
  },

  /**
   * Get a single auction by ID
   * @param {string} auctionId - The auction ID
   * @returns {Promise} Auction details
   */
  getAuctionDetails: async (auctionId) => {
    const response = await api.get(`/auctions/${auctionId}`);
    return response.data;
  },

  /**
   * Get all items for a specific auction
   * @param {string} auctionId - The auction ID
   * @returns {Promise} Array of auction items
   */
  getAuctionItems: async (auctionId) => {
    const response = await api.get(`/auctions/${auctionId}/items`);
    return response.data;
  },
};

export const { getAuctions, getAuctionDetails, getAuctionItems } =
  publicAuctionsAPI;
export default publicAuctionsAPI;
