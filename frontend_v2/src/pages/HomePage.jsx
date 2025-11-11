import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Zap,
  Shield,
  Eye,
  Clock,
  TrendingUp,
  Star,
  MessageSquare,
} from "lucide-react";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { getAuctions } from "../api/publicAuctionsAPI";

/**
 * Home Page - Landing page with hero, features, and auction showcase
 *
 * Sections:
 * 1. Hero Section - Main headline + CTA
 * 2. Features - 3 key platform benefits
 * 3. Live Auctions - Real auction data from API
 * 4. How It Works - 4-step process
 * 5. CTA Section - Final call to action
 */
const HomePage = () => {
  const navigate = useNavigate();
  const [liveAuctions, setLiveAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveAuctions();
  }, []);

  const fetchLiveAuctions = async () => {
    try {
      setLoading(true);
      // Fetch active auctions, limit to 6 for homepage
      const auctions = await getAuctions({ status: "active", limit: 6 });
      setLiveAuctions(auctions);
    } catch (err) {
      console.error("Failed to fetch live auctions:", err);
      setLiveAuctions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-blue-100 to-primary-100 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
            Real-Time Auctions,
            <br />
            <span className="text-primary-600">Fair Bidding</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-slide-up">
            Join the transparent auction platform where verified hosts conduct
            live auctions with instant bidding updates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
            <a href="#auctions">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Explore Live Auctions
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
            <a href="/register">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Start Hosting
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Vendly?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-xl hover:bg-gray-50 transition-all">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Real-Time Bidding
              </h3>
              <p className="text-gray-600">
                Instant WebSocket updates ensure you never miss a bid.
                Experience lightning-fast, transparent bidding.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-xl hover:bg-gray-50 transition-all">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Verified Hosts
              </h3>
              <p className="text-gray-600">
                All auction hosts are admin-approved. Only trusted, verified
                clients can create auctions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-xl hover:bg-gray-50 transition-all">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Transparent Process
              </h3>
              <p className="text-gray-600">
                All bids are visible, rules are clear, and the process is fair.
                No hidden fees or surprises.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Auctions Section */}
      <section id="auctions" className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              🔴 Live Auctions Now
            </h2>
            <Button variant="ghost" onClick={() => navigate("/auctions")}>
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading live auctions...</p>
            </div>
          ) : liveAuctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveAuctions.map((auction) => (
                <div
                  key={auction._id}
                  onClick={() => navigate(`/auctions/${auction._id}`)}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="relative h-48 bg-gradient-to-br from-primary-100 via-blue-100 to-purple-100 flex items-center justify-center">
                    <div className="text-center p-6">
                      <TrendingUp className="w-16 h-16 text-primary-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 font-medium">
                        Live Auction
                      </p>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="error">🔴 LIVE</Badge>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                      {auction.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {auction.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(auction.end_time).toLocaleDateString()}
                      </div>
                      <Button size="sm" variant="ghost">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Live Auctions Right Now
                </h3>
                <p className="text-gray-600 mb-6">
                  Check back soon or browse scheduled auctions!
                </p>
                <Button
                  variant="secondary"
                  onClick={() => navigate("/auctions")}
                >
                  Browse All Auctions
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Create Account
              </h3>
              <p className="text-gray-600 text-sm">
                Sign up as a participant to bid or as a client to host auctions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Browse Auctions
              </h3>
              <p className="text-gray-600 text-sm">
                Explore live and scheduled auctions from verified hosts.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Bid in Real-Time
              </h3>
              <p className="text-gray-600 text-sm">
                Join auctions and place bids with instant WebSocket updates.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Win & Transact
              </h3>
              <p className="text-gray-600 text-sm">
                Win items and complete secure transactions with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback & Reviews Section */}
      <section className="py-16 px-4 bg-linear-to-br from-primary-50 via-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              We Value Your Feedback
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Help us improve Vendly! Share your experience, suggestions, or
              report issues. Your feedback shapes our platform.
            </p>
          </div>

          {/* Feedback Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* User Reviews */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                User Reviews
              </h3>
              <p className="text-gray-600 mb-4">
                Share your experience with the platform and help others make
                informed decisions.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                <span>Rate your experience</span>
              </div>
            </div>

            {/* Feature Requests */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Feature Requests
              </h3>
              <p className="text-gray-600 mb-4">
                Have an idea to make Vendly better? We'd love to hear your
                suggestions!
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <MessageSquare className="w-4 h-4 text-blue-500 mr-1" />
                <span>Suggest improvements</span>
              </div>
            </div>

            {/* Bug Reports */}
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Report Issues
              </h3>
              <p className="text-gray-600 mb-4">
                Encountered a problem? Let us know so we can fix it quickly.
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <Shield className="w-4 h-4 text-red-500 mr-1" />
                <span>Help us improve</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <a href="http://localhost:8080/Vendly/feedback_form.jsp" target="_blank" rel="noopener noreferrer">
              <Button
                variant="secondary"
                size="lg"
              >
                Submit Feedback
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
            <p className="text-sm text-gray-500 mt-4">
              Your feedback helps us serve you better
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
