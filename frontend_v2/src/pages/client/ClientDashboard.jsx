import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import clientAPI from "../../api/clientAPI";
import Navbar from "../../components/layouts/Navbar";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import {
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Package,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";

/**
 * Client Dashboard - Manage auctions and view profile status
 *
 * Features:
 * - Display client profile status (pending, approved, suspended)
 * - View created auctions
 * - Create new auctions (only if approved)
 * - Status-based UI rendering
 */
const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileStatus, setProfileStatus] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { auctionId, title }
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchClientProfile();
    fetchAuctions();
  }, []);

  const fetchClientProfile = async () => {
    try {
      setIsLoading(true);
      setError("");
      const profileData = await clientAPI.getProfile();

      // Map backend status to frontend format
      // Backend: PENDING_APPROVAL, APPROVED, SUSPENDED
      // Frontend: pending_approval, approved, suspended
      const statusMap = {
        pending_approval: "pending_approval",
        approved: "approved",
        suspended: "suspended",
      };

      setProfileStatus(statusMap[profileData.status] || "pending_approval");
    } catch (err) {
      console.error("Failed to fetch client profile:", err);
      setError("Failed to load profile status. Please try again.");
      // Default to pending if error occurs
      setProfileStatus("pending_approval");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuctions = async () => {
    try {
      const auctionsData = await clientAPI.getMyAuctions();
      setAuctions(auctionsData);
    } catch (err) {
      console.error("Failed to fetch auctions:", err);
      // Don't show error for auctions, just keep empty array
    }
  };

  const handleCreateAuction = () => {
    navigate("/client/create-auction");
  };

  const handleDeleteAuction = async () => {
    if (!deleteConfirm) return;

    try {
      setIsDeleting(true);
      setError("");

      await clientAPI.deleteAuction(deleteConfirm.auctionId);

      // Remove auction from local state
      setAuctions((prev) =>
        prev.filter((a) => a._id !== deleteConfirm.auctionId)
      );

      // Close confirmation modal
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete auction:", err);
      const errorMessage =
        err.response?.data?.detail ||
        "Failed to delete auction. Please try again.";
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const canDeleteAuction = (status) => {
    // Can only delete scheduled or finished auctions
    return status === "scheduled" || status === "finished";
  };

  // Render different content based on profile status
  const renderStatusContent = () => {
    switch (profileStatus) {
      case "pending_approval":
        return (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-8">
              <Clock className="w-16 h-16 text-amber-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Profile Pending Approval
              </h2>
              <p className="text-gray-700 mb-6">
                Your client profile is currently under review by our admin team.
                You'll be able to create and manage auctions once your profile
                is approved.
              </p>
              <div className="bg-white rounded-lg p-6 border border-amber-200">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What happens next?
                </h3>
                <ul className="text-left text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Our team will review your registration details</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      You'll receive an email notification once approved
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      Then you can start creating auctions immediately
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );

      case "suspended":
        return (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Account Suspended
              </h2>
              <p className="text-gray-700 mb-6">
                Your client profile has been suspended. You cannot create or
                manage auctions at this time.
              </p>
              <p className="text-gray-600">
                Please contact support at{" "}
                <a
                  href="mailto:support@vendly.com"
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  support@vendly.com
                </a>{" "}
                for more information.
              </p>
            </div>
          </div>
        );

      case "approved":
        return (
          <div className="max-w-7xl mx-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Auctions
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {auctions.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Active Auctions
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {auctions.filter((a) => a.status === "active").length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Scheduled
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {auctions.filter((a) => a.status === "scheduled").length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Auctions Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    My Auctions
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Manage your created auctions
                  </p>
                </div>
                <Button variant="secondary" onClick={handleCreateAuction}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Auction
                </Button>
              </div>

              <div className="p-6">
                {auctions.length === 0 ? (
                  /* Empty State */
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Auctions Yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Get started by creating your first auction!
                    </p>
                    <Button variant="secondary" onClick={handleCreateAuction}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Auction
                    </Button>
                  </div>
                ) : (
                  /* Auctions List */
                  <div className="space-y-4">
                    {auctions.map((auction) => (
                      <div
                        key={auction._id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {auction.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {auction.description}
                            </p>
                            <div className="flex items-center gap-4 mt-3">
                              <Badge
                                variant={
                                  auction.status === "active"
                                    ? "success"
                                    : auction.status === "scheduled"
                                    ? "info"
                                    : auction.status === "finished"
                                    ? "default"
                                    : "warning"
                                }
                              >
                                {auction.status}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {new Date(
                                  auction.start_time
                                ).toLocaleDateString()}
                              </span>
                              <span className="text-sm text-gray-500">
                                Max: {auction.config.max_participants}{" "}
                                participants
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {auction.status === "scheduled" && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  navigate(
                                    `/client/auctions/${auction._id}/items/add`
                                  )
                                }
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Items
                              </Button>
                            )}
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/client/auctions/${auction._id}/manage`
                                )
                              }
                            >
                              Manage
                            </Button>
                            {canDeleteAuction(auction.status) && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  setDeleteConfirm({
                                    auctionId: auction._id,
                                    title: auction.title,
                                  })
                                }
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Client Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Welcome back,{" "}
                <span className="font-semibold">{user?.username}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="info">Client</Badge>
              {profileStatus && (
                <Badge
                  variant={
                    profileStatus === "approved"
                      ? "success"
                      : profileStatus === "suspended"
                      ? "error"
                      : "warning"
                  }
                >
                  {profileStatus === "pending_approval"
                    ? "Pending Approval"
                    : profileStatus === "approved"
                    ? "Approved"
                    : "Suspended"}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            <span className="ml-3 text-gray-600">
              Loading your dashboard...
            </span>
          </div>
        ) : (
          renderStatusContent()
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Auction
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Are you sure you want to delete "{deleteConfirm.title}"? This
                  action will also delete all associated items, registrations,
                  and bids. This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAuction}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Auction
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientDashboard;
