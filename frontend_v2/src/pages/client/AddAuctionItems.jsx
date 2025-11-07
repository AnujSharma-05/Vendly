import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import auctionItemsAPI from "../../api/auctionItemsAPI";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Navbar from "../../components/layouts/Navbar";
import {
  Package,
  DollarSign,
  Image as ImageIcon,
  AlertCircle,
  Plus,
  X,
  ArrowLeft,
  Check,
} from "lucide-react";

/**
 * Add Auction Items Page
 * Allows clients to add items to their auction one by one
 */
const AddAuctionItems = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();

  // Form state for single item
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    base_price: "",
    category: "",
    image_urls: [""],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      });
    }
  };

  // Handle image URL changes
  const handleImageChange = (index, value) => {
    const newImageUrls = [...formData.image_urls];
    newImageUrls[index] = value;
    setFormData({
      ...formData,
      image_urls: newImageUrls,
    });
  };

  // Add new image URL field
  const addImageField = () => {
    if (formData.image_urls.length < 5) {
      setFormData({
        ...formData,
        image_urls: [...formData.image_urls, ""],
      });
    }
  };

  // Remove image URL field
  const removeImageField = (index) => {
    const newImageUrls = formData.image_urls.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      image_urls: newImageUrls.length > 0 ? newImageUrls : [""],
    });
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Item name is required";
    } else if (formData.name.length > 200) {
      errors.name = "Name must be 200 characters or less";
    }

    if (formData.description && formData.description.length > 2000) {
      errors.description = "Description must be 2000 characters or less";
    }

    if (!formData.base_price) {
      errors.base_price = "Base price is required";
    } else if (parseFloat(formData.base_price) <= 0) {
      errors.base_price = "Base price must be greater than 0";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Filter out empty image URLs
      const filteredImageUrls = formData.image_urls.filter((url) => url.trim());

      const itemData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        base_price: parseFloat(formData.base_price),
        category: formData.category.trim() || null,
        image_urls: filteredImageUrls,
      };

      await auctionItemsAPI.addItem(auctionId, itemData);

      // Show success message
      setSuccess(true);

      // Reset form
      setFormData({
        name: "",
        description: "",
        base_price: "",
        category: "",
        image_urls: [""],
      });

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to add item:", err);
      setError(
        err.response?.data?.detail || "Failed to add item. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate("/client/dashboard")}
                className="flex items-center text-primary-600 hover:text-primary-700 mb-2 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Add Auction Items
              </h1>
              <p className="mt-2 text-gray-600">
                Add items to your auction one by one
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <Check className="w-5 h-5 text-green-600 mr-3 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Item added successfully!
                </p>
                <p className="text-sm text-green-600 mt-1">
                  You can add another item below or go back to dashboard.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Item Details Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Item Details
            </h2>

            <div className="space-y-4">
              {/* Item Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <Package className="w-4 h-4 inline mr-1" />
                  Item Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g., Vintage Camera"
                  value={formData.name}
                  onChange={handleChange}
                  error={validationErrors.name}
                  maxLength={200}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.name.length}/200 characters
                </p>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Provide details about the item..."
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                    validationErrors.description
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                  maxLength={2000}
                />
                {validationErrors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.description.length}/2000 characters
                </p>
              </div>

              {/* Base Price and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="base_price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Base Price <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="base_price"
                    name="base_price"
                    type="number"
                    placeholder="e.g., 250.00"
                    value={formData.base_price}
                    onChange={handleChange}
                    error={validationErrors.base_price}
                    min="0.01"
                    step="0.01"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Starting bid amount
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Category
                  </label>
                  <Input
                    id="category"
                    name="category"
                    type="text"
                    placeholder="e.g., Electronics"
                    value={formData.category}
                    onChange={handleChange}
                    maxLength={100}
                  />
                  <p className="mt-1 text-xs text-gray-500">Optional</p>
                </div>
              </div>
            </div>
          </div>

          {/* Image URLs Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Item Images (Optional)
              </h2>
              {formData.image_urls.length < 5 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addImageField}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Image URL
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {formData.image_urls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={url}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                    />
                  </div>
                  {formData.image_urls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}

              <p className="text-xs text-gray-500 mt-2">
                <ImageIcon className="w-3 h-3 inline mr-1" />
                Maximum 5 image URLs. Leave empty if no images available.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/client/dashboard")}
              disabled={isSubmitting}
            >
              Done Adding Items
            </Button>
            <Button
              type="submit"
              variant="secondary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isSubmitting ? "Adding Item..." : "Add Item"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAuctionItems;
