import api from "./axios";

/**
 * Auction Items API Service
 * Handles operations for managing auction items (add, list, update, delete)
 */

const auctionItemsAPI = {
  /**
   * Add a new item to an auction
   * @param {string} auctionId - The auction ID
   * @param {Object} itemData - Item data (name, description, base_price, category, image_urls)
   * @returns {Promise} Created item data
   */
  addItem: async (auctionId, itemData) => {
    const response = await api.post(
      `/client/auctions/${auctionId}/items`,
      itemData
    );
    return response.data;
  },

  /**
   * Get all items for a specific auction
   * @param {string} auctionId - The auction ID
   * @returns {Promise} Array of items
   */
  getItems: async (auctionId) => {
    const response = await api.get(`/client/auctions/${auctionId}/items`);
    return response.data;
  },

  /**
   * Update an auction item
   * @param {string} auctionId - The auction ID
   * @param {string} itemId - The item ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise} Updated item data
   */
  updateItem: async (auctionId, itemId, updateData) => {
    const response = await api.put(
      `/client/auctions/${auctionId}/items/${itemId}`,
      updateData
    );
    return response.data;
  },

  /**
   * Delete an auction item
   * @param {string} auctionId - The auction ID
   * @param {string} itemId - The item ID
   * @returns {Promise} void
   */
  deleteItem: async (auctionId, itemId) => {
    const response = await api.delete(
      `/client/auctions/${auctionId}/items/${itemId}`
    );
    return response.data;
  },
};

export const { addItem, getItems, updateItem, deleteItem } = auctionItemsAPI;
export default auctionItemsAPI;
