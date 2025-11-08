import api from "./axios";

/**
 * Participant API Service
 * Handles participant-specific operations like dashboard stats, auctions, bids
 */

const participantAPI = {
  /**
   * Get participant dashboard statistics
   * @returns {Promise} Stats object with active_auctions, won_items, total_spent, active_bids
   */
  getStats: async () => {
    const response = await api.get("/participant/stats");
    return response.data;
  },

  /**
   * Get all auctions the participant has joined
   * @returns {Promise} Array of auctions with participant-specific data
   */
  getMyAuctions: async () => {
    const response = await api.get("/participant/auctions");
    return response.data;
  },

  /**
   * Get participant's active/winning bids
   * @returns {Promise} Array of active bids
   */
  getActiveBids: async () => {
    const response = await api.get("/participant/bids");
    return response.data;
  },

  /**
   * Get participant's won items from completed auctions
   * @returns {Promise} Array of won items (winning bids)
   */
  getWonItems: async () => {
    const response = await api.get("/participant/wins");
    return response.data;
  },

  /**
   * Get complete bid history
   * @returns {Promise} Array of all bids (winning and non-winning)
   */
  getBidHistory: async () => {
    const response = await api.get("/participant/history");
    return response.data;
  },

  /**
   * Check if participant is registered for a specific auction
   * @param {string} auctionId - Auction ID to check
   * @returns {Promise} Object with is_registered boolean and registration data
   */
  checkRegistrationStatus: async (auctionId) => {
    const response = await api.get(
      `/participant/auctions/${auctionId}/registration-status`
    );
    return response.data;
  },

  /**
   * Join/register for an auction
   * @param {string} auctionId - Auction ID to join
   * @returns {Promise} Registration data
   */
  joinAuction: async (auctionId) => {
    const response = await api.post(`/participant/auctions/${auctionId}/join`);
    return response.data;
  },

  /**
   * Leave an auction (before it starts)
   * @param {string} auctionId - Auction ID to leave
   * @returns {Promise} No content (204)
   */
  leaveAuction: async (auctionId) => {
    const response = await api.delete(
      `/participant/auctions/${auctionId}/leave`
    );
    return response.data;
  },

  /**
   * Place a bid on an auction item
   * @param {string} itemId - Item ID to bid on
   * @param {number} amount - Bid amount
   * @returns {Promise} Created bid data
   */
  placeBid: async (itemId, amount) => {
    const response = await api.post(`/participant/items/${itemId}/bid`, {
      amount,
    });
    return response.data;
  },
};

export const {
  getStats,
  getMyAuctions,
  getActiveBids,
  getWonItems,
  getBidHistory,
  checkRegistrationStatus,
  joinAuction,
  leaveAuction,
  placeBid,
} = participantAPI;

export default participantAPI;
