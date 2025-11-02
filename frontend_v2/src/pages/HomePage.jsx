import React from "react";
import { ArrowRight, Zap, Shield, Eye, Clock } from "lucide-react";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

/**
 * Home Page - Landing page with hero, features, and auction showcase
 *
 * Sections:
 * 1. Hero Section - Main headline + CTA
 * 2. Features - 3 key platform benefits
 * 3. Live Auctions - Placeholder cards (API integration later)
 * 4. How It Works - 4-step process
 * 5. CTA Section - Final call to action
 */
const HomePage = () => {
  // Placeholder auction data (will be replaced with API call)
  const mockAuctions = [
    {
      id: 1,
      title: "Vintage Camera Collection",
      host: "PhotoPro",
      status: "live",
      participants: "24/50",
      image:
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400",
    },
    {
      id: 2,
      title: "Rare Comic Books Bundle",
      host: "ComicVault",
      status: "scheduled",
      participants: "12/30",
      image:
        "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400",
    },
    {
      id: 3,
      title: "Antique Furniture Set",
      host: "VintageHomes",
      status: "live",
      participants: "18/40",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400",
    },
  ];

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
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
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
            <a href="/auctions">
              <Button variant="ghost">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockAuctions.map((auction) => (
              <div
                key={auction.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={auction.image}
                    alt={auction.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={auction.status === "live" ? "error" : "warning"}
                    >
                      {auction.status === "live" ? "🔴 LIVE" : "🟡 SCHEDULED"}
                    </Badge>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                    {auction.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Host: <span className="font-medium">{auction.host}</span>
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {auction.participants}
                    </div>
                    <Button size="sm" variant="ghost">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State (show when no auctions) */}
          {mockAuctions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">
                No live auctions right now. Check back soon!
              </p>
              <Button variant="secondary">Browse Scheduled Auctions</Button>
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

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-primary-100 mb-8">
            Join thousands of users already bidding and hosting on Vendly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Create Account
              </Button>
            </a>
            <a href="/auctions">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
              >
                Browse Auctions
              </Button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
