import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/layouts/Navbar";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import {
  ArrowLeft,
  Save,
  Trash2,
  Edit2,
  Plus,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { getAuction, updateAuction } from "../../api/clientAPI";
import { getItems, updateItem, deleteItem } from "../../api/auctionItemsAPI";

/**
 * ManageAuction Component
 * Allows clients to:
 * 1. Edit auction details (title, description, config)
 * 2. View all items in the auction
 * 3. Edit item details (name, description, base_price, category, images)
 * 4. Delete items
 */
const ManageAuction = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState("details"); // "details" or "items"

  // Auction state
  const [auction, setAuction] = useState(null);
  const [auctionForm, setAuctionForm] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    max_participants: "",
    entry_mode: "",
    participant_spending_limit: "",
    allow_anonymous_spectators: false,
  });
  const [auctionErrors, setAuctionErrors] = useState({});

  // Items state
  const [items, setItems] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemForm, setEditingItemForm] = useState({});
  const [itemErrors, setItemErrors] = useState({});

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch auction and items
  useEffect(() => {
    fetchAuctionData();
  }, [auctionId]);

  const fetchAuctionData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch auction details
      const auctionData = await getAuction(auctionId);
      setAuction(auctionData);
      setAuctionForm({
        title: auctionData.title,
        description: auctionData.description,
        start_time: auctionData.start_time.slice(0, 16), // Format for datetime-local
        end_time: auctionData.end_time.slice(0, 16),
        max_participants: auctionData.config.max_participants,
        entry_mode: auctionData.config.entry_mode,
        participant_spending_limit:
          auctionData.config.participant_spending_limit,
        allow_anonymous_spectators:
          auctionData.config.allow_anonymous_spectators,
      });

      // Fetch items
      const itemsData = await getItems(auctionId);
      setItems(itemsData);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load auction data");
    } finally {
      setLoading(false);
    }
  };

  // Auction form handlers
  const handleAuctionInputChange = (e) => {
    const { name, value } = e.target;
    setAuctionForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (auctionErrors[name]) {
      setAuctionErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateAuctionForm = () => {
    const errors = {};

    if (!auctionForm.title.trim()) {
      errors.title = "Title is required";
    } else if (auctionForm.title.length > 200) {
      errors.title = "Title must be less than 200 characters";
    }

    if (auctionForm.description && auctionForm.description.length > 2000) {
      errors.description = "Description must be less than 2000 characters";
    }

    const startTime = new Date(auctionForm.start_time);
    const endTime = new Date(auctionForm.end_time);
    const now = new Date();

    if (startTime < now && auction.status === "scheduled") {
      errors.start_time = "Start time must be in the future";
    }

    if (endTime <= startTime) {
      errors.end_time = "End time must be after start time";
    }

    const maxParticipants = parseInt(auctionForm.max_participants);
    if (isNaN(maxParticipants) || maxParticipants < 1) {
      errors.max_participants = "Must be at least 1";
    }

    const spendingLimit = parseFloat(auctionForm.participant_spending_limit);
    if (isNaN(spendingLimit) || spendingLimit <= 0) {
      errors.participant_spending_limit = "Must be greater than 0";
    }

    setAuctionErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateAuction = async (e) => {
    e.preventDefault();

    if (!validateAuctionForm()) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const updateData = {
        title: auctionForm.title,
        description: auctionForm.description,
        start_time: new Date(auctionForm.start_time).toISOString(),
        end_time: new Date(auctionForm.end_time).toISOString(),
        config: {
          max_participants: parseInt(auctionForm.max_participants),
          entry_mode: auctionForm.entry_mode,
          participant_spending_limit: parseFloat(
            auctionForm.participant_spending_limit
          ),
          allow_anonymous_spectators: auctionForm.allow_anonymous_spectators,
        },
      };

      await updateAuction(auctionId, updateData);
      setSuccess("Auction updated successfully!");

      // Refresh auction data
      const updatedAuction = await getAuction(auctionId);
      setAuction(updatedAuction);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update auction");
    } finally {
      setSaving(false);
    }
  };

  // Item management handlers
  const handleEditItem = (item) => {
    setEditingItemId(item._id);
    setEditingItemForm({
      name: item.name,
      description: item.description || "",
      base_price: item.base_price,
      category: item.category || "",
      image_urls: item.image_urls || [],
    });
    setItemErrors({});
  };

  const handleCancelEditItem = () => {
    setEditingItemId(null);
    setEditingItemForm({});
    setItemErrors({});
  };

  const handleItemFormChange = (field, value) => {
    setEditingItemForm((prev) => ({ ...prev, [field]: value }));
    if (itemErrors[field]) {
      setItemErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddImageUrl = () => {
    if (editingItemForm.image_urls.length < 5) {
      setEditingItemForm((prev) => ({
        ...prev,
        image_urls: [...prev.image_urls, ""],
      }));
    }
  };

  const handleRemoveImageUrl = (index) => {
    setEditingItemForm((prev) => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index),
    }));
  };

  const handleImageUrlChange = (index, value) => {
    const newImageUrls = [...editingItemForm.image_urls];
    newImageUrls[index] = value;
    setEditingItemForm((prev) => ({ ...prev, image_urls: newImageUrls }));
  };

  const validateItemForm = () => {
    const errors = {};

    if (!editingItemForm.name.trim()) {
      errors.name = "Name is required";
    } else if (editingItemForm.name.length > 200) {
      errors.name = "Name must be less than 200 characters";
    }

    if (
      editingItemForm.description &&
      editingItemForm.description.length > 2000
    ) {
      errors.description = "Description must be less than 2000 characters";
    }

    const basePrice = parseFloat(editingItemForm.base_price);
    if (isNaN(basePrice) || basePrice <= 0) {
      errors.base_price = "Base price must be greater than 0";
    }

    setItemErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveItem = async (itemId) => {
    if (!validateItemForm()) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const updateData = {
        name: editingItemForm.name,
        description: editingItemForm.description,
        base_price: parseFloat(editingItemForm.base_price),
        category: editingItemForm.category,
        image_urls: editingItemForm.image_urls.filter((url) => url.trim()),
      };

      await updateItem(auctionId, itemId, updateData);

      // Refresh items
      const updatedItems = await getItems(auctionId);
      setItems(updatedItems);

      setEditingItemId(null);
      setEditingItemForm({});
      setSuccess("Item updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await deleteItem(auctionId, itemId);

      // Remove from local state
      setItems((prev) => prev.filter((item) => item._id !== itemId));

      setSuccess("Item deleted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to delete item");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading auction data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !auction) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate("/client/dashboard")}
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const canEdit = auction?.status === "scheduled";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/client/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Auction Header */}
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {auction?.title}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <Badge
                    variant={
                      auction?.status === "active"
                        ? "success"
                        : auction?.status === "scheduled"
                        ? "info"
                        : auction?.status === "finished"
                        ? "default"
                        : "warning"
                    }
                  >
                    {auction?.status}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              {!canEdit && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                  <p className="text-sm text-yellow-800">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    Only scheduled auctions can be edited
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("details")}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "details"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Auction Details
              </button>
              <button
                onClick={() => setActiveTab("items")}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === "items"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Items ({items.length})
              </button>
            </div>
          </div>

          {/* Messages */}
          {success && (
            <div className="mx-6 mt-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                  <p className="text-green-700">{success}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mx-6 mt-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "details" ? (
              /* Auction Details Form */
              <form onSubmit={handleUpdateAuction} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Auction Title"
                      name="title"
                      value={auctionForm.title}
                      onChange={handleAuctionInputChange}
                      error={auctionErrors.title}
                      disabled={!canEdit}
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={auctionForm.description}
                      onChange={handleAuctionInputChange}
                      disabled={!canEdit}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    {auctionErrors.description && (
                      <p className="text-red-600 text-sm mt-1">
                        {auctionErrors.description}
                      </p>
                    )}
                    <p className="text-gray-500 text-sm mt-1">
                      {auctionForm.description.length}/2000 characters
                    </p>
                  </div>

                  <div>
                    <Input
                      label="Start Time"
                      type="datetime-local"
                      name="start_time"
                      value={auctionForm.start_time}
                      onChange={handleAuctionInputChange}
                      error={auctionErrors.start_time}
                      disabled={!canEdit}
                      required
                    />
                  </div>

                  <div>
                    <Input
                      label="End Time"
                      type="datetime-local"
                      name="end_time"
                      value={auctionForm.end_time}
                      onChange={handleAuctionInputChange}
                      error={auctionErrors.end_time}
                      disabled={!canEdit}
                      required
                    />
                  </div>

                  <div>
                    <Input
                      label="Max Participants"
                      type="number"
                      name="max_participants"
                      value={auctionForm.max_participants}
                      onChange={handleAuctionInputChange}
                      error={auctionErrors.max_participants}
                      disabled={!canEdit}
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entry Mode *
                    </label>
                    <select
                      name="entry_mode"
                      value={auctionForm.entry_mode}
                      onChange={handleAuctionInputChange}
                      disabled={!canEdit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="public">Public</option>
                      <option value="invite_only">Invite Only</option>
                    </select>
                    {auctionErrors.entry_mode && (
                      <p className="text-red-600 text-sm mt-1">
                        {auctionErrors.entry_mode}
                      </p>
                    )}
                  </div>

                  <div>
                    <Input
                      label="Participant Spending Limit ($)"
                      type="number"
                      name="participant_spending_limit"
                      value={auctionForm.participant_spending_limit}
                      onChange={handleAuctionInputChange}
                      error={auctionErrors.participant_spending_limit}
                      disabled={!canEdit}
                      step="0.01"
                      min="0.01"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="allow_anonymous_spectators"
                        checked={auctionForm.allow_anonymous_spectators}
                        onChange={(e) =>
                          setAuctionForm((prev) => ({
                            ...prev,
                            allow_anonymous_spectators: e.target.checked,
                          }))
                        }
                        disabled={!canEdit}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Allow anonymous spectators
                      </span>
                    </label>
                  </div>
                </div>

                {canEdit && (
                  <div className="flex justify-end">
                    <Button type="submit" variant="secondary" disabled={saving}>
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </form>
            ) : (
              /* Items List */
              <div className="space-y-4">
                {items.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">
                      No items added to this auction yet.
                    </p>
                    {canEdit && (
                      <Button
                        variant="secondary"
                        onClick={() =>
                          navigate(`/client/auctions/${auctionId}/items/add`)
                        }
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Items
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    {canEdit && (
                      <div className="flex justify-end mb-4">
                        <Button
                          variant="secondary"
                          onClick={() =>
                            navigate(`/client/auctions/${auctionId}/items/add`)
                          }
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add More Items
                        </Button>
                      </div>
                    )}

                    {items.map((item) => (
                      <div
                        key={item._id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        {editingItemId === item._id ? (
                          /* Edit Mode */
                          <div className="space-y-4">
                            <div>
                              <Input
                                label="Item Name"
                                value={editingItemForm.name}
                                onChange={(e) =>
                                  handleItemFormChange("name", e.target.value)
                                }
                                error={itemErrors.name}
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                              </label>
                              <textarea
                                value={editingItemForm.description}
                                onChange={(e) =>
                                  handleItemFormChange(
                                    "description",
                                    e.target.value
                                  )
                                }
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              {itemErrors.description && (
                                <p className="text-red-600 text-sm mt-1">
                                  {itemErrors.description}
                                </p>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Input
                                  label="Base Price ($)"
                                  type="number"
                                  value={editingItemForm.base_price}
                                  onChange={(e) =>
                                    handleItemFormChange(
                                      "base_price",
                                      e.target.value
                                    )
                                  }
                                  error={itemErrors.base_price}
                                  step="0.01"
                                  min="0.01"
                                  required
                                />
                              </div>

                              <div>
                                <Input
                                  label="Category"
                                  value={editingItemForm.category}
                                  onChange={(e) =>
                                    handleItemFormChange(
                                      "category",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>

                            {/* Image URLs */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Image URLs (Max 5)
                              </label>
                              <div className="space-y-2">
                                {editingItemForm.image_urls.map(
                                  (url, index) => (
                                    <div key={index} className="flex gap-2">
                                      <Input
                                        value={url}
                                        onChange={(e) =>
                                          handleImageUrlChange(
                                            index,
                                            e.target.value
                                          )
                                        }
                                        placeholder={`Image URL ${index + 1}`}
                                      />
                                      <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() =>
                                          handleRemoveImageUrl(index)
                                        }
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  )
                                )}
                                {editingItemForm.image_urls.length < 5 && (
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    onClick={handleAddImageUrl}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Image URL
                                  </Button>
                                )}
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={handleCancelEditItem}
                                disabled={saving}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                variant="secondary"
                                onClick={() => handleSaveItem(item._id)}
                                disabled={saving}
                              >
                                <Save className="w-4 h-4 mr-2" />
                                {saving ? "Saving..." : "Save"}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          /* View Mode */
                          <div>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">
                                  {item.name}
                                </h3>
                                {item.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {item.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-3">
                                  <span className="text-sm font-medium text-gray-900">
                                    Base Price: ${item.base_price.toFixed(2)}
                                  </span>
                                  {item.category && (
                                    <Badge variant="default">
                                      {item.category}
                                    </Badge>
                                  )}
                                  <Badge
                                    variant={
                                      item.status === "active"
                                        ? "success"
                                        : item.status === "pending"
                                        ? "info"
                                        : "default"
                                    }
                                  >
                                    {item.status}
                                  </Badge>
                                </div>
                                {item.image_urls &&
                                  item.image_urls.length > 0 && (
                                    <div className="mt-3">
                                      <p className="text-sm text-gray-500 mb-2">
                                        Images: {item.image_urls.length}
                                      </p>
                                      <div className="flex gap-2 flex-wrap">
                                        {item.image_urls.map((url, idx) => (
                                          <div
                                            key={idx}
                                            className="w-16 h-16 bg-gray-100 rounded border border-gray-200 overflow-hidden"
                                          >
                                            <img
                                              src={url}
                                              alt={`${item.name} ${idx + 1}`}
                                              className="w-full h-full object-cover"
                                              onError={(e) => {
                                                e.target.style.display = "none";
                                              }}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                              </div>

                              {canEdit && (
                                <div className="flex gap-2 ml-4">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleEditItem(item)}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDeleteItem(item._id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAuction;
