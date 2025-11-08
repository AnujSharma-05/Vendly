import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/layouts/Navbar";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Package,
  TrendingUp,
  Lock,
  Globe,
  Eye,
  AlertCircle,
  CheckCircle,
  Timer,
  Gavel,
} from "lucide-react";
import { getAuctionDetails, getAuctionItems } from "../api/publicAuctionsAPI";
import { joinAuction, checkRegistrationStatus } from "../api/participantAPI";
import { useAuth } from "../context/AuthContext";

/**
 * Auction Details Page
 * Shows comprehensive information about a specific auction
 * Displays all items, auction rules, and join button
 */
const AuctionDetailsPage = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  // State
  const [auction, setAuction] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joiningAuction, setJoiningAuction] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    fetchAuctionData();

    // Auto-refresh every 30 seconds to update status and items
    const interval = setInterval(fetchAuctionData, 30000);
    return () => clearInterval(interval);
  }, [auctionId]);

  useEffect(() => {
    // Fetch registration status when user is authenticated and is a participant
    if (
      !authLoading &&
      isAuthenticated &&
      user?.role === "participant" &&
      auctionId
    ) {
      fetchRegistrationStatus();
    } else if (!isAuthenticated) {
      // Reset joined status if not authenticated
      setHasJoined(false);
    }
  }, [authLoading, isAuthenticated, user, auctionId]);

  const fetchAuctionData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch auction details and items in parallel
      const [auctionData, itemsData] = await Promise.all([
        getAuctionDetails(auctionId),
        getAuctionItems(auctionId),
      ]);

      setAuction(auctionData);
      setItems(itemsData);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load auction details");
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrationStatus = async () => {
    try {
      const result = await checkRegistrationStatus(auctionId);
      setHasJoined(result.is_registered);
    } catch (err) {
      // If error (e.g., not authenticated), assume not joined
      console.error("Failed to check registration status:", err);
      setHasJoined(false);
    }
  };

  const handleJoinAuction = async () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/auctions/${auctionId}`);
      return;
    }

    // Check if user is a participant
    if (user?.role !== "participant") {
      alert(
        "Only participants can join auctions. Please register as a participant."
      );
      return;
    }

    // Only allow joining scheduled or live auctions
    if (auction.status !== "scheduled" && auction.status !== "active") {
      alert("You can only join upcoming or live auctions");
      return;
    }

    try {
      setJoiningAuction(true);
      setError("");
      setSuccessMessage("");

      await joinAuction(auctionId);

      // Mark as joined
      setHasJoined(true);

      setSuccessMessage(
        auction.status === "scheduled"
          ? "Successfully registered for the auction! Redirecting to your dashboard..."
          : "Successfully joined the live auction! Redirecting to your dashboard..."
      );

      // Redirect to participant dashboard after 2 seconds
      setTimeout(() => {
        navigate("/participant/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Failed to join auction:", err);
      const errorMessage =
        err.response?.data?.detail ||
        "Failed to join auction. Please try again.";
      setError(errorMessage);

      // Clear error after 5 seconds
      setTimeout(() => setError(""), 5000);
    } finally {
      setJoiningAuction(false);
    }
  };

  const getTimeRemaining = () => {
    if (!auction) return null;

    const now = new Date();
    const start = new Date(auction.start_time);
    const end = new Date(auction.end_time);

    if (auction.status === "active") {
      const diff = end - now;
      if (diff <= 0) return { label: "Auction ended", expired: true };

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0)
        return {
          label: `${days}d ${hours}h ${minutes}m remaining`,
          expired: false,
        };
      if (hours > 0)
        return { label: `${hours}h ${minutes}m remaining`, expired: false };
      return { label: `${minutes}m remaining`, expired: false };
    } else if (auction.status === "scheduled") {
      const diff = start - now;

      // If scheduled auction time has passed, it should be active (backend might not have updated yet)
      if (diff <= 0) {
        return {
          label: "Auction should be starting",
          expired: false,
          shouldBeActive: true,
        };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0)
        return { label: `Starts in ${days}d ${hours}h`, expired: false };
      if (hours > 0)
        return { label: `Starts in ${hours}h ${minutes}m`, expired: false };
      return { label: `Starts in ${minutes}m`, expired: false };
    }

    return null;
  };

  const canJoin = () => {
    if (!auction) return false;
    return auction.status === "active" || auction.status === "scheduled";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading auction details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 mr-3" />
              <div>
                <h3 className="font-semibold text-red-900 text-lg">Error</h3>
                <p className="text-red-700 mt-1">
                  {error || "Auction not found"}
                </p>
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate("/auctions")}
            className="mt-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Auctions
          </Button>
        </div>
      </div>
    );
  }

  const timeRemaining = getTimeRemaining();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/auctions")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Auctions
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Auction Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge
                      variant={
                        auction.status === "active"
                          ? "success"
                          : auction.status === "scheduled"
                          ? "info"
                          : "default"
                      }
                    >
                      {auction.status === "active" && (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      )}
                      {auction.status === "active"
                        ? "Live Now"
                        : auction.status}
                    </Badge>
                    {timeRemaining && (
                      <span
                        className={`text-sm font-medium ${
                          timeRemaining.expired
                            ? "text-red-600"
                            : timeRemaining.shouldBeActive
                            ? "text-orange-600"
                            : "text-gray-700"
                        }`}
                      >
                        <Timer className="w-4 h-4 inline mr-1" />
                        {timeRemaining.label}
                      </span>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {auction.title}
                  </h1>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {auction.description}
                  </p>

                  {/* Warning if scheduled time has passed */}
                  {auction.status === "scheduled" &&
                    timeRemaining?.shouldBeActive && (
                      <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-start">
                          <AlertCircle className="w-5 h-5 text-orange-600 mr-2 mt-0.5" />
                          <div>
                            <p className="text-sm text-orange-800 font-medium">
                              Auction start time has passed
                            </p>
                            <p className="text-xs text-orange-700 mt-1">
                              The auction should be active now. The page will
                              auto-refresh every 30 seconds to update the
                              status.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Auction Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Auction Items ({items.length})
                </h2>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No items added to this auction yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <div
                      key={item._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      {/* Item Images */}
                      {item.image_urls && item.image_urls.length > 0 && (
                        <div className="mb-3 grid grid-cols-3 gap-2">
                          {item.image_urls.slice(0, 3).map((url, idx) => (
                            <div
                              key={idx}
                              className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
                            >
                              <img
                                src={url}
                                alt={`${item.name} ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/150?text=No+Image";
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      <h3 className="font-semibold text-gray-900 mb-2">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <span className="text-sm text-gray-500 block">
                            Base Price
                          </span>
                          <span className="text-lg font-bold text-gray-900">
                            ${item.base_price.toFixed(2)}
                          </span>
                        </div>
                        {item.category && (
                          <Badge variant="default">{item.category}</Badge>
                        )}
                      </div>

                      {item.current_bid && (
                        <div className="mb-3 pb-3 border-b border-gray-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-500">
                              Last Bid
                            </span>
                            <span className="text-lg font-bold text-green-600">
                              ${item.current_bid.toFixed(2)}
                            </span>
                          </div>
                          {item.bid_count > 0 && (
                            <div className="flex items-center justify-end mt-1">
                              <span className="text-xs text-gray-500">
                                {item.bid_count}{" "}
                                {item.bid_count === 1 ? "bid" : "bids"} placed
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {item.status && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <Badge
                            variant={
                              item.status === "active"
                                ? "success"
                                : item.status === "pending"
                                ? "info"
                                : "default"
                            }
                            className="text-xs"
                          >
                            {item.status}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1 space-y-6">
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-green-800">
                      Success
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                      {successMessage}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-red-800">
                      Error
                    </h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Join Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Join This Auction
              </h3>

              {/* Auction Schedule */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Start Time
                    </p>
                    <p className="text-sm text-gray-900">
                      {new Date(auction.start_time).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      End Time
                    </p>
                    <p className="text-sm text-gray-900">
                      {new Date(auction.end_time).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Auction Rules */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-3 text-sm">
                  Auction Rules
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-900">
                      Max {auction.config.max_participants} participants
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-900">
                      Spending limit: $
                      {auction.config.participant_spending_limit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {auction.config.entry_mode === "public" ? (
                      <Globe className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Lock className="w-4 h-4 text-blue-600" />
                    )}
                    <span className="text-blue-900">
                      {auction.config.entry_mode === "public"
                        ? "Public - Anyone can join"
                        : "Invite Only"}
                    </span>
                  </div>
                  {auction.config.allow_anonymous_spectators && (
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span className="text-blue-900">Spectators allowed</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {canJoin() ? (
                  <>
                    {hasJoined ? (
                      <>
                        <Button variant="success" className="w-full" disabled>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Registered
                        </Button>
                        {auction.status === "active" && (
                          <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() =>
                              navigate(
                                `/participant/auctions/${auctionId}/live`
                              )
                            }
                          >
                            <Gavel className="w-4 h-4 mr-2" />
                            Start Bidding
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        onClick={handleJoinAuction}
                        className="w-full"
                        disabled={joiningAuction}
                        variant={
                          auction.status === "active" ? "primary" : "secondary"
                        }
                      >
                        {joiningAuction ? (
                          <>
                            <Timer className="w-4 h-4 mr-2 animate-spin" />
                            {auction.status === "active"
                              ? "Joining..."
                              : "Registering..."}
                          </>
                        ) : (
                          <>
                            {auction.status === "active"
                              ? "Join Now"
                              : "Register to Join"}
                          </>
                        )}
                      </Button>
                    )}
                    {!isAuthenticated && (
                      <p className="text-xs text-gray-500 text-center">
                        You need to be logged in to join this auction
                      </p>
                    )}
                  </>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      This auction is no longer accepting participants
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Auction Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {auction.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items</span>
                  <span className="font-medium text-gray-900">
                    {items.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium text-gray-900">
                    {new Date(auction.start_time).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetailsPage;
