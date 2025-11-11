import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layouts/Navbar";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  Package,
  Search,
  Filter,
  RefreshCw,
  Eye,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { getAuctions } from "../api/publicAuctionsAPI";
import { joinAuction, checkRegistrationStatus } from "../api/participantAPI";

/**
 * Public Auctions Page
 * Shows all ongoing and upcoming auctions
 * Anyone can view this page (no authentication required)
 */
const AuctionsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // State
  const [auctions, setAuctions] = useState([]);
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, scheduled, active
  const [joiningAuctionId, setJoiningAuctionId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [joinedAuctionIds, setJoinedAuctionIds] = useState(new Set());

  // Fetch auctions
  useEffect(() => {
    fetchAuctions();

    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchAuctions, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch registration statuses when auth state changes or auctions load
  useEffect(() => {
    if (
      !authLoading &&
      isAuthenticated &&
      user?.role === "participant" &&
      auctions.length > 0
    ) {
      fetchRegistrationStatuses(auctions);
    } else if (!isAuthenticated) {
      // Clear joined auctions if user is not authenticated
      setJoinedAuctionIds(new Set());
    }
  }, [authLoading, isAuthenticated, user, auctions]);

  // Filter auctions when search or filter changes
  useEffect(() => {
    filterAuctions();
  }, [searchQuery, statusFilter, auctions]);

  const fetchAuctions = async () => {
    try {
      setError("");
      const data = await getAuctions();

      // Filter only scheduled and active auctions
      const visibleAuctions = data.filter(
        (auction) =>
          auction.status === "scheduled" || auction.status === "active"
      );

      setAuctions(visibleAuctions);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load auctions");
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrationStatuses = async (auctionsList) => {
    try {
      // Check registration status for each auction
      const statusPromises = auctionsList.map(async (auction) => {
        try {
          const result = await checkRegistrationStatus(auction._id);
          return { auctionId: auction._id, isRegistered: result.is_registered };
        } catch (err) {
          // If error (e.g., not authenticated), return false
          console.error(
            `Failed to check registration for ${auction._id}:`,
            err
          );
          return { auctionId: auction._id, isRegistered: false };
        }
      });

      const statuses = await Promise.all(statusPromises);

      // Update joinedAuctionIds with registered auctions
      const registeredIds = statuses
        .filter((s) => s.isRegistered)
        .map((s) => s.auctionId);

      setJoinedAuctionIds(new Set(registeredIds));
    } catch (err) {
      console.error("Failed to fetch registration statuses:", err);
    }
  };

  const filterAuctions = () => {
    let filtered = [...auctions];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((auction) => auction.status === statusFilter);
    }

    // Filter by search query (title or description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (auction) =>
          auction.title.toLowerCase().includes(query) ||
          auction.description.toLowerCase().includes(query)
      );
    }

    setFilteredAuctions(filtered);
  };

  const handleJoinAuction = async (auctionId, auctionStatus) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      alert("Please login to join auctions");
      navigate("/login");
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
    if (auctionStatus !== "scheduled" && auctionStatus !== "active") {
      alert("You can only join upcoming or live auctions");
      return;
    }

    try {
      setJoiningAuctionId(auctionId);
      setError("");
      setSuccessMessage("");

      await joinAuction(auctionId);

      // Add to joined auctions set
      setJoinedAuctionIds((prev) => new Set([...prev, auctionId]));

      setSuccessMessage(
        auctionStatus === "scheduled"
          ? "Successfully registered for the auction!"
          : "Successfully joined the live auction!"
      );

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);

      // Optionally redirect to participant dashboard
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
      setJoiningAuctionId(null);
    }
  };

  const getAuctionStatus = (auction) => {
    const now = new Date();
    const startTime = new Date(auction.start_time);
    const endTime = new Date(auction.end_time);

    if (auction.status === "active") {
      return {
        label: "Live Now",
        variant: "success",
        icon: TrendingUp,
      };
    } else if (auction.status === "scheduled" && startTime > now) {
      return {
        label: "Upcoming",
        variant: "info",
        icon: Clock,
      };
    } else {
      return {
        label: auction.status,
        variant: "default",
        icon: Calendar,
      };
    }
  };

  const formatTimeRemaining = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = start - now;

    if (diff <= 0) return "Starting soon";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `Starts in ${days}d ${hours}h`;
    if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
    return `Starts in ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading auctions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-linear-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Live Auctions</h1>
            <p className="text-xl text-blue-100 mb-6">
              Discover exciting auctions happening now and coming soon
            </p>
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-semibold">
                  {auctions.filter((a) => a.status === "active").length} Live
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">
                  {auctions.filter((a) => a.status === "scheduled").length}{" "}
                  Upcoming
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search auctions by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("active")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === "active"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Live Now
              </button>
              <button
                onClick={() => setStatusFilter("scheduled")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === "scheduled"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Upcoming
              </button>
            </div>

            {/* Refresh Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchAuctions}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-green-800">Success</h3>
              <p className="text-sm text-green-700 mt-1">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {filteredAuctions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Auctions Found
            </h3>
            <p className="text-gray-600">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters or search query"
                : "Check back soon for new auctions!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuctions.map((auction) => {
              const status = getAuctionStatus(auction);
              const StatusIcon = status.icon;

              return (
                <div
                  key={auction._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* Status Badge */}
                  <div className="px-4 pt-4 pb-2">
                    <Badge
                      variant={status.variant}
                      className="inline-flex items-center gap-1"
                    >
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </Badge>
                  </div>

                  {/* Auction Content */}
                  <div className="px-4 pb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {auction.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {auction.description}
                    </p>

                    {/* Auction Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {new Date(auction.start_time).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>
                          {auction.status === "scheduled"
                            ? formatTimeRemaining(auction.start_time)
                            : `Ends ${new Date(
                                auction.end_time
                              ).toLocaleDateString()}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>
                          Max {auction.config.max_participants} participants
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span>
                          Limit: ${auction.config.participant_spending_limit}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/auctions/${auction._id}`)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      {joinedAuctionIds.has(auction._id) ? (
                        <Button
                          variant="success"
                          size="sm"
                          disabled
                          className="flex-1"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Registered
                        </Button>
                      ) : (
                        <>
                          {auction.status === "active" && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                handleJoinAuction(auction._id, auction.status)
                              }
                              disabled={joiningAuctionId === auction._id}
                              className="flex-1"
                            >
                              {joiningAuctionId === auction._id ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                  Joining...
                                </>
                              ) : (
                                "Join Now"
                              )}
                            </Button>
                          )}
                          {auction.status === "scheduled" && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() =>
                                handleJoinAuction(auction._id, auction.status)
                              }
                              disabled={joiningAuctionId === auction._id}
                              className="flex-1"
                            >
                              {joiningAuctionId === auction._id ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                  Registering...
                                </>
                              ) : (
                                "Register"
                              )}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionsPage;
