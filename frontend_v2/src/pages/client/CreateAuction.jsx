import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import clientAPI from "../../api/clientAPI";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Navbar from "../../components/layouts/Navbar";
import {
  Calendar,
  DollarSign,
  Users,
  Lock,
  Globe,
  Eye,
  AlertCircle,
  Plus,
  ArrowLeft,
} from "lucide-react";

/**
 * Create Auction Page - Allows approved clients to create new auctions
 *
 * Features:
 * - Auction details form (title, description, times)
 * - Configuration options (max participants, entry mode, spending limit)
 * - Form validation
 * - Real-time error feedback
 */
const CreateAuction = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_time: "",
    end_time: "",
    max_participants: "",
    entry_mode: "public",
    participant_spending_limit: "",
    allow_anonymous_spectators: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: "",
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Title is required";
    } else if (formData.title.length > 100) {
      errors.title = "Title must be 100 characters or less";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    if (!formData.start_time) {
      errors.start_time = "Start time is required";
    }

    if (!formData.end_time) {
      errors.end_time = "End time is required";
    }

    if (formData.start_time && formData.end_time) {
      const startDate = new Date(formData.start_time);
      const endDate = new Date(formData.end_time);
      const now = new Date();

      if (startDate < now) {
        errors.start_time = "Start time must be in the future";
      }

      if (endDate <= startDate) {
        errors.end_time = "End time must be after start time";
      }
    }

    if (!formData.max_participants) {
      errors.max_participants = "Max participants is required";
    } else if (
      parseInt(formData.max_participants) < 1 ||
      parseInt(formData.max_participants) > 1000
    ) {
      errors.max_participants = "Must be between 1 and 1000";
    }

    if (!formData.participant_spending_limit) {
      errors.participant_spending_limit = "Spending limit is required";
    } else if (parseFloat(formData.participant_spending_limit) <= 0) {
      errors.participant_spending_limit = "Must be greater than 0";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Format data for API
      const auctionData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        config: {
          max_participants: parseInt(formData.max_participants),
          entry_mode: formData.entry_mode,
          participant_spending_limit: parseFloat(
            formData.participant_spending_limit
          ),
          allow_anonymous_spectators: formData.allow_anonymous_spectators,
        },
      };

      const response = await clientAPI.createAuction(auctionData);
      console.log("Auction created successfully:", response);

      // Navigate back to dashboard
      navigate("/client/dashboard");
    } catch (err) {
      console.error("Failed to create auction:", err);

      // Handle different error formats
      let errorMessage = "Failed to create auction. Please try again.";

      if (err.response?.data) {
        const errorData = err.response.data;

        // Handle FastAPI validation errors (422)
        if (Array.isArray(errorData.detail)) {
          // Format validation errors
          errorMessage = errorData.detail
            .map((error) => `${error.loc.join(" > ")}: ${error.msg}`)
            .join(", ");
        } else if (typeof errorData.detail === "string") {
          // Handle string error messages
          errorMessage = errorData.detail;
        } else if (typeof errorData.detail === "object") {
          // Handle object error messages
          errorMessage = JSON.stringify(errorData.detail);
        }
      }

      setError(errorMessage);
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
                Create New Auction
              </h1>
              <p className="mt-2 text-gray-600">
                Set up your auction details and configuration
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Auction Details Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Auction Details
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Auction Title <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g., Premium Electronics Auction"
                  value={formData.title}
                  onChange={handleChange}
                  error={validationErrors.title}
                  maxLength={100}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.title.length}/100 characters
                </p>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  placeholder="Provide details about your auction..."
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all ${
                    validationErrors.description
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300"
                  }`}
                />
                {validationErrors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.description}
                  </p>
                )}
              </div>

              {/* Start and End Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="start_time"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="start_time"
                    name="start_time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={handleChange}
                    error={validationErrors.start_time}
                  />
                </div>

                <div>
                  <label
                    htmlFor="end_time"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    <Calendar className="w-4 h-4 inline mr-1" />
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="end_time"
                    name="end_time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={handleChange}
                    error={validationErrors.end_time}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Auction Configuration Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Auction Configuration
            </h2>

            <div className="space-y-4">
              {/* Max Participants */}
              <div>
                <label
                  htmlFor="max_participants"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <Users className="w-4 h-4 inline mr-1" />
                  Maximum Participants <span className="text-red-500">*</span>
                </label>
                <Input
                  id="max_participants"
                  name="max_participants"
                  type="number"
                  placeholder="e.g., 50"
                  value={formData.max_participants}
                  onChange={handleChange}
                  error={validationErrors.max_participants}
                  min="1"
                  max="1000"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Maximum number of participants allowed in the auction (1-1000)
                </p>
              </div>

              {/* Entry Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entry Mode <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.entry_mode === "public"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="entry_mode"
                      value="public"
                      checked={formData.entry_mode === "public"}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-1 text-primary-600" />
                        <span className="font-medium text-gray-900">
                          Public
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Anyone can join
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.entry_mode === "invite_only"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="entry_mode"
                      value="invite_only"
                      checked={formData.entry_mode === "invite_only"}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="ml-3">
                      <div className="flex items-center">
                        <Lock className="w-4 h-4 mr-1 text-primary-600" />
                        <span className="font-medium text-gray-900">
                          Invite Only
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        By invitation only
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Spending Limit */}
              <div>
                <label
                  htmlFor="participant_spending_limit"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Participant Spending Limit{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Input
                  id="participant_spending_limit"
                  name="participant_spending_limit"
                  type="number"
                  placeholder="e.g., 10000"
                  value={formData.participant_spending_limit}
                  onChange={handleChange}
                  error={validationErrors.participant_spending_limit}
                  min="0"
                  step="0.01"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Maximum amount each participant can spend in this auction
                </p>
              </div>

              {/* Allow Anonymous Spectators */}
              <div className="flex items-start">
                <input
                  id="allow_anonymous_spectators"
                  name="allow_anonymous_spectators"
                  type="checkbox"
                  checked={formData.allow_anonymous_spectators}
                  onChange={handleChange}
                  className="w-4 h-4 mt-1 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="allow_anonymous_spectators"
                  className="ml-3 block"
                >
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Allow Anonymous Spectators
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Allow non-registered users to watch the auction without
                    bidding
                  </p>
                </label>
              </div>
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
              Cancel
            </Button>
            <Button
              type="submit"
              variant="secondary"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isSubmitting ? "Creating..." : "Create Auction"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAuction;
