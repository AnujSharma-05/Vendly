import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layouts/Navbar";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import {
  ArrowLeft,
  Gavel,
  TrendingUp,
  DollarSign,
  Timer,
  Trophy,
  AlertCircle,
  CheckCircle,
  Loader2,
  Package,
  Clock,
  Users,
} from "lucide-react";
import {
  getAuctionDetails,
  getAuctionItems,
} from "../../api/publicAuctionsAPI";
import { placeBid, checkRegistrationStatus } from "../../api/participantAPI";

/**
 * Live Auction Page - Participant bidding interface
 * Shows all items in the auction with real-time bidding
 */
const LiveAuctionPage = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Auction data
  const [auction, setAuction] = useState(null);
  const [items, setItems] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Bidding state
  const [biddingItemId, setBiddingItemId] = useState(null);
  const [bidAmounts, setBidAmounts] = useState({}); // { itemId: amount }
  const [placingBid, setPlacingBid] = useState(null); // itemId being bid on

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "participant") {
      navigate("/login");
      return;
    }

    fetchAuctionData();
    checkRegistration();

    // Auto-refresh items every 10 seconds for real-time updates
    const interval = setInterval(fetchItems, 10000);
    return () => clearInterval(interval);
  }, [auctionId]);

  const fetchAuctionData = async () => {
    try {
      setLoading(true);
      setError("");

      const [auctionData, itemsData] = await Promise.all([
        getAuctionDetails(auctionId),
        getAuctionItems(auctionId),
      ]);

      setAuction(auctionData);
      setItems(itemsData);

      // Initialize bid amounts (current bid + 1, or base price + 1 if no bids)
      const initialBidAmounts = {};
      itemsData.forEach((item) => {
        const minBid = item.current_bid
          ? item.current_bid + 1
          : item.base_price + 1;
        initialBidAmounts[item._id] = minBid.toFixed(2);
      });
      setBidAmounts(initialBidAmounts);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load auction");
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const itemsData = await getAuctionItems(auctionId);
      setItems(itemsData);
    } catch (err) {
      console.error("Failed to refresh items:", err);
    }
  };

  const checkRegistration = async () => {
    try {
      const result = await checkRegistrationStatus(auctionId);
      setIsRegistered(result.is_registered);

      if (!result.is_registered) {
        setError("You must join this auction before bidding");
      }
    } catch (err) {
      console.error("Failed to check registration:", err);
      setIsRegistered(false);
    }
  };

  const handleBidAmountChange = (itemId, value) => {
    setBidAmounts((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handlePlaceBid = async (item) => {
    if (!isRegistered) {
      setError("You must join this auction before placing bids");
      return;
    }

    const bidAmount = parseFloat(bidAmounts[item._id]);

    if (isNaN(bidAmount) || bidAmount <= 0) {
      setError("Please enter a valid bid amount");
      return;
    }

    // Check against current bid if exists, otherwise against base price
    const minRequired = item.current_bid || item.base_price;
    if (bidAmount <= minRequired) {
      setError(
        `Bid must be greater than ${
          item.current_bid ? "current bid" : "base price"
        } $${minRequired.toFixed(2)}`
      );
      return;
    }

    try {
      setPlacingBid(item._id);
      setError("");
      setSuccessMessage("");

      await placeBid(item._id, bidAmount);

      setSuccessMessage(
        `Successfully placed bid of $${bidAmount.toFixed(2)} on ${item.name}!`
      );

      // Refresh items to get updated bid info
      await fetchItems();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);

      // Reset bid amount to new minimum
      setBidAmounts((prev) => ({
        ...prev,
        [item._id]: (bidAmount + 1).toFixed(2),
      }));
    } catch (err) {
      console.error("Failed to place bid:", err);
      const errorMessage =
        err.response?.data?.detail || "Failed to place bid. Please try again.";
      setError(errorMessage);

      // Clear error after 5 seconds
      setTimeout(() => setError(""), 5000);
    } finally {
      setPlacingBid(null);
    }
  };

  const getTimeRemaining = () => {
    if (!auction) return null;

    const now = new Date();
    const end = new Date(auction.end_time);
    const diff = end - now;

    if (diff <= 0) return { label: "Auction Ended", expired: true };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      label: `${hours}h ${minutes}m ${seconds}s remaining`,
      expired: false,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-blue-600 mx-auto animate-spin" />
            <p className="mt-4 text-gray-600">Loading auction...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !auction) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 mr-3" />
              <div>
                <h3 className="font-semibold text-red-900 text-lg">Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate("/participant/dashboard")}
            className="mt-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
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
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/participant/dashboard")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          {timeRemaining && (
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeRemaining.expired
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              <Timer className="w-5 h-5" />
              <span className="font-semibold">{timeRemaining.label}</span>
            </div>
          )}
        </div>

        {/* Auction Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {auction?.title}
              </h1>
              <p className="text-gray-600">{auction?.description}</p>
            </div>
            <Badge variant="success" className="text-lg px-4 py-2">
              <TrendingUp className="w-5 h-5 mr-2" />
              Live Now
            </Badge>
          </div>

          {!isRegistered && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
              <div>
                <p className="text-yellow-800 font-medium">
                  You are not registered for this auction
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  Please join the auction from the auctions page to place bids.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-green-800">
                  Success
                </h3>
                <p className="text-sm text-green-700 mt-1">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Items Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Auction Items ({items.length})
          </h2>

          {items.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Items Available
              </h3>
              <p className="text-gray-600">
                This auction doesn't have any items yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Item Image */}
                  {item.image_urls && item.image_urls.length > 0 ? (
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                      <img
                        src={item.image_urls[0]}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/400x300?text=No+Image";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gray-100 flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                  )}

                  {/* Item Content */}
                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>

                    {/* Price Info */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Base Price
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          ${item.base_price.toFixed(2)}
                        </span>
                      </div>
                      {item.current_bid && (
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-gray-600">
                              Last Bid
                            </span>
                            <span className="text-lg font-bold text-green-600">
                              ${item.current_bid.toFixed(2)}
                            </span>
                          </div>
                          {item.bid_count > 0 && (
                            <div className="flex items-center justify-end">
                              <span className="text-xs text-gray-500">
                                {item.bid_count}{" "}
                                {item.bid_count === 1 ? "bid" : "bids"} placed
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                      <Badge
                        variant={
                          item.status === "active"
                            ? "success"
                            : item.status === "pending"
                            ? "info"
                            : "default"
                        }
                      >
                        {item.status === "active" && (
                          <Gavel className="w-3 h-3 mr-1" />
                        )}
                        {item.status}
                      </Badge>
                    </div>

                    {/* Bidding Interface */}
                    {item.status === "active" || item.status === "pending" ? (
                      <div className="space-y-3">
                        <Input
                          type="number"
                          step="0.01"
                          min={(item.current_bid || item.base_price) + 0.01}
                          value={bidAmounts[item._id] || ""}
                          onChange={(e) =>
                            handleBidAmountChange(item._id, e.target.value)
                          }
                          placeholder={`Min: $${(
                            (item.current_bid || item.base_price) + 0.01
                          ).toFixed(2)}`}
                          disabled={!isRegistered || placingBid === item._id}
                          className="w-full"
                        />
                        <Button
                          variant="secondary"
                          onClick={() => handlePlaceBid(item)}
                          disabled={
                            !isRegistered ||
                            placingBid === item._id ||
                            !bidAmounts[item._id]
                          }
                          className="w-full"
                        >
                          {placingBid === item._id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Placing Bid...
                            </>
                          ) : (
                            <>
                              <Gavel className="w-4 h-4 mr-2" />
                              Place Bid
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-600">
                          {item.status === "sold"
                            ? "Item Sold"
                            : "Bidding Closed"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveAuctionPage;
