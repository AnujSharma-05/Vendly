import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import participantAPI from "../../api/participantAPI";
import Navbar from "../../components/layouts/Navbar";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import {
  TrendingUp,
  Trophy,
  DollarSign,
  Gavel,
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  Package,
  Timer,
} from "lucide-react";

/**
 * Participant Dashboard - View joined auctions, bids, and statistics
 *
 * Features:
 * - Dashboard statistics (active auctions, won items, total spent, active bids)
 * - 4 tabs: My Auctions, Active Bids, Won Items, History
 * - Real-time auction status and countdown timers
 * - Comprehensive participation tracking
 */
const ParticipantDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Stats state
  const [stats, setStats] = useState({
    active_auctions: 0,
    won_items: 0,
    total_spent: 0,
    active_bids: 0,
  });

  // Tab data state
  const [myAuctions, setMyAuctions] = useState([]);
  const [activeBids, setActiveBids] = useState([]);
  const [wonItems, setWonItems] = useState([]);
  const [bidHistory, setBidHistory] = useState([]);

  // UI state
  const [activeTab, setActiveTab] = useState("auctions"); // auctions, bids, wins, history
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Fetch stats and initial tab data in parallel
      const [statsData, auctionsData] = await Promise.all([
        participantAPI.getStats(),
        participantAPI.getMyAuctions(),
      ]);

      setStats(statsData);
      setMyAuctions(auctionsData);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when tab changes
  const handleTabChange = async (tab) => {
    setActiveTab(tab);

    try {
      switch (tab) {
        case "auctions":
          if (myAuctions.length === 0) {
            const data = await participantAPI.getMyAuctions();
            setMyAuctions(data);
          }
          break;
        case "bids":
          const bidsData = await participantAPI.getActiveBids();
          setActiveBids(bidsData);
          break;
        case "wins":
          const winsData = await participantAPI.getWonItems();
          setWonItems(winsData);
          break;
        case "history":
          const historyData = await participantAPI.getBidHistory();
          setBidHistory(historyData);
          break;
      }
    } catch (err) {
      console.error(`Failed to fetch ${tab} data:`, err);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    const variants = {
      scheduled: "primary",
      live: "success",
      completed: "secondary",
      cancelled: "danger",
    };
    return variants[status] || "secondary";
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Participant Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user?.username}! Track your auctions, bids, and
              winnings.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Active Auctions */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">
                  Active
                </span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.active_auctions}
              </h3>
              <p className="text-sm text-gray-600">Active Auctions</p>
            </div>

            {/* Won Items */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Wins</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.won_items}
              </h3>
              <p className="text-sm text-gray-600">Won Items</p>
            </div>

            {/* Total Spent */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Spent</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {formatCurrency(stats.total_spent)}
              </h3>
              <p className="text-sm text-gray-600">Total Spent</p>
            </div>

            {/* Active Bids */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Gavel className="w-6 h-6 text-amber-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">
                  Bidding
                </span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {stats.active_bids}
              </h3>
              <p className="text-sm text-gray-600">Active Bids</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                <button
                  onClick={() => handleTabChange("auctions")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "auctions"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  My Auctions ({myAuctions.length})
                </button>
                <button
                  onClick={() => handleTabChange("bids")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "bids"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Active Bids ({stats.active_bids})
                </button>
                <button
                  onClick={() => handleTabChange("wins")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "wins"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Won Items ({stats.won_items})
                </button>
                <button
                  onClick={() => handleTabChange("history")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "history"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  History
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "auctions" && (
                <MyAuctionsTab
                  auctions={myAuctions}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  getStatusVariant={getStatusVariant}
                  navigate={navigate}
                />
              )}
              {activeTab === "bids" && (
                <ActiveBidsTab
                  bids={activeBids}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              )}
              {activeTab === "wins" && (
                <WonItemsTab
                  wins={wonItems}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              )}
              {activeTab === "history" && (
                <HistoryTab
                  history={bidHistory}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Tab Components
const MyAuctionsTab = ({
  auctions,
  formatCurrency,
  formatDate,
  getStatusVariant,
  navigate,
}) => {
  if (auctions.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Auctions Yet
        </h3>
        <p className="text-gray-600 mb-6">
          You haven't joined any auctions yet. Browse available auctions to get
          started!
        </p>
        <Button onClick={() => navigate("/auctions")}>Browse Auctions</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {auctions.map((auction) => (
        <div
          key={auction._id || auction.id}
          className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {auction.title}
                </h3>
                <Badge variant={getStatusVariant(auction.status)}>
                  {auction.status}
                </Badge>
              </div>
              <p className="text-gray-600 mb-4">{auction.description}</p>
            </div>
          </div>

          {/* Auction Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">My Bids</p>
              <p className="text-lg font-semibold text-gray-900">
                {auction.my_bids_count}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">My Wins</p>
              <p className="text-lg font-semibold text-green-600">
                {auction.my_won_items}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">My Spent</p>
              <p className="text-lg font-semibold text-purple-600">
                {formatCurrency(auction.my_spent)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Remaining Budget</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatCurrency(auction.my_remaining_budget)}
              </p>
            </div>
          </div>

          {/* Time Info */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Starts: {formatDate(auction.start_time)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Ends: {formatDate(auction.end_time)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/auctions/${auction._id || auction.id}`)}
              className="flex-1 sm:flex-none"
            >
              View Details
            </Button>
            {auction.status === "active" && (
              <Button
                variant="secondary"
                onClick={() =>
                  navigate(
                    `/participant/auctions/${auction._id || auction.id}/live`
                  )
                }
                className="flex-1 sm:flex-none"
              >
                <Gavel className="w-4 h-4 mr-1" />
                Start Bidding
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const ActiveBidsTab = ({ bids, formatCurrency, formatDate }) => {
  if (bids.length === 0) {
    return (
      <div className="text-center py-12">
        <Gavel className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Active Bids
        </h3>
        <p className="text-gray-600">
          You don't have any active bids at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bids.map((bid) => (
        <div
          key={bid._id || bid.id}
          className="border border-green-200 bg-green-50 rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-gray-900">Winning Bid</h4>
            </div>
            <p className="text-sm text-gray-600">Item ID: {bid.item_id}</p>
            <p className="text-xs text-gray-500 mt-1">
              Placed: {formatDate(bid.placed_at)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(bid.amount)}
            </p>
            <Badge variant="success" className="mt-1">
              Leading
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

const WonItemsTab = ({ wins, formatCurrency, formatDate }) => {
  if (wins.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Won Items Yet
        </h3>
        <p className="text-gray-600">
          You haven't won any items yet. Keep bidding!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {wins.map((win) => (
        <div
          key={win._id || win.id}
          className="border border-amber-200 bg-amber-50 rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-amber-600" />
              <h4 className="font-semibold text-gray-900">Won Item</h4>
            </div>
            <p className="text-sm text-gray-600">Item ID: {win.item_id}</p>
            <p className="text-xs text-gray-500 mt-1">
              Won: {formatDate(win.placed_at)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-amber-600">
              {formatCurrency(win.amount)}
            </p>
            <Badge variant="warning" className="mt-1">
              Won
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

const HistoryTab = ({ history, formatCurrency, formatDate }) => {
  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <Timer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Bid History
        </h3>
        <p className="text-gray-600">
          Your bid history will appear here once you start bidding.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((bid) => (
        <div
          key={bid._id || bid.id}
          className={`border rounded-lg p-4 ${
            bid.is_winning
              ? "border-green-200 bg-green-50"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {bid.is_winning ? (
                  <Trophy className="w-4 h-4 text-green-600" />
                ) : (
                  <Gavel className="w-4 h-4 text-gray-600" />
                )}
                <h4 className="font-semibold text-gray-900">
                  {bid.is_winning ? "Winning Bid" : "Bid"}
                </h4>
              </div>
              <p className="text-sm text-gray-600">Item ID: {bid.item_id}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDate(bid.placed_at)}
              </p>
            </div>
            <div className="text-right">
              <p
                className={`text-xl font-bold ${
                  bid.is_winning ? "text-green-600" : "text-gray-900"
                }`}
              >
                {formatCurrency(bid.amount)}
              </p>
              <Badge
                variant={bid.is_winning ? "success" : "secondary"}
                className="mt-1"
              >
                {bid.is_winning ? "Leading" : "Outbid"}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ParticipantDashboard;
