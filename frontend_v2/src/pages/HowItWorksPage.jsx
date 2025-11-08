import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";
import Button from "../components/ui/Button";
import {
  UserPlus,
  Search,
  Gavel,
  Trophy,
  ArrowRight,
  CheckCircle,
  Users,
  Shield,
  Clock,
  DollarSign,
  Eye,
  Zap,
  Package,
  Star,
} from "lucide-react";

/**
 * How It Works Page
 * Comprehensive guide for both participants and clients
 */
const HowItWorksPage = () => {
  const navigate = useNavigate();

  const participantSteps = [
    {
      icon: UserPlus,
      title: "Create Participant Account",
      description:
        "Sign up for free as a participant. Complete your profile with basic information to start bidding.",
      color: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      icon: Search,
      title: "Browse Live & Scheduled Auctions",
      description:
        "Explore auctions from verified hosts. Filter by status, category, or schedule. Preview items before joining.",
      color: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      icon: CheckCircle,
      title: "Register for Auctions",
      description:
        "Join auctions that interest you. Each auction has a spending limit to ensure fair participation.",
      color: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      icon: Gavel,
      title: "Bid in Real-Time",
      description:
        "Place bids during live auctions. See updates instantly as others bid. Track your budget and winning items.",
      color: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      icon: Trophy,
      title: "Win & Celebrate",
      description:
        "Check your dashboard for winning bids and bid history. Complete transactions securely with auction hosts.",
      color: "bg-red-100",
      iconColor: "text-red-600",
    },
  ];

  const clientSteps = [
    {
      icon: UserPlus,
      title: "Create Client Account",
      description:
        "Sign up as a client/host. Provide business details for admin verification.",
      color: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      icon: Shield,
      title: "Wait for Approval",
      description:
        "Admin team reviews your profile. Approval typically takes 24-48 hours. You'll receive an email notification.",
      color: "bg-cyan-100",
      iconColor: "text-cyan-600",
    },
    {
      icon: Package,
      title: "Create Your Auction",
      description:
        "Set up auction details: title, schedule, participant limits, and spending caps. Add items with descriptions and images.",
      color: "bg-violet-100",
      iconColor: "text-violet-600",
    },
    {
      icon: Zap,
      title: "Go Live & Monitor",
      description:
        "Your auction starts automatically at the scheduled time. Monitor participants, bids, and item status in real-time.",
      color: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      icon: DollarSign,
      title: "Complete Transactions",
      description:
        "After auction ends, view winners and finalize sales. Manage multiple auctions from your dashboard.",
      color: "bg-teal-100",
      iconColor: "text-teal-600",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "Instant Updates",
      description: "Real-time bidding with WebSocket technology",
    },
    {
      icon: Shield,
      title: "Verified Hosts",
      description: "All clients are admin-approved",
    },
    {
      icon: Eye,
      title: "Transparent Bids",
      description: "See all bids and prices openly",
    },
    {
      icon: Clock,
      title: "Scheduled Auctions",
      description: "Plan ahead with clear timelines",
    },
    {
      icon: DollarSign,
      title: "Spending Limits",
      description: "Budget controls for responsible bidding",
    },
    {
      icon: Users,
      title: "Fair Participation",
      description: "Capped participant numbers per auction",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-blue-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            How Vendly Works
          </h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Your complete guide to participating in auctions or hosting your
            own. Simple, transparent, and secure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/register")}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Get Started Now
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/auctions")}
            >
              <Search className="w-5 h-5 mr-2" />
              Browse Auctions
            </Button>
          </div>
        </div>
      </section>

      {/* Quick Features Grid */}
      <section className="py-12 px-4 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 mr-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-primary-600" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Participants Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              For Participants (Bidders)
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join exciting auctions and bid on items you love. It's fast, fair,
              and fun!
            </p>
          </div>

          <div className="space-y-8">
            {participantSteps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row items-start bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                  <div
                    className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center`}
                  >
                    <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-900 text-white rounded-full text-sm font-bold mr-3">
                      {index + 1}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < participantSteps.length - 1 && (
                  <div className="hidden md:block ml-6 text-gray-300">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/register?role=participant")}
            >
              Start Bidding Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* For Clients Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 text-white rounded-full mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              For Clients (Auction Hosts)
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Host professional auctions and reach eager bidders. Simple setup,
              powerful tools.
            </p>
          </div>

          <div className="space-y-8">
            {clientSteps.map((step, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row items-start bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
                  <div
                    className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center`}
                  >
                    <step.icon className={`w-8 h-8 ${step.iconColor}`} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-900 text-white rounded-full text-sm font-bold mr-3">
                      {index + 1}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < clientSteps.length - 1 && (
                  <div className="hidden md:block ml-6 text-gray-300">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/register?role=client")}
            >
              Become a Host
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Rules & Guidelines */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Rules & Guidelines
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Participant Rules */}
            <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
              <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2" />
                Participant Guidelines
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    Register before auction starts
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    Respect spending limits per auction
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    Bids must be higher than previous bids
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    Cannot leave active auctions
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    Complete transactions after winning
                  </span>
                </li>
              </ul>
            </div>

            {/* Client Rules */}
            <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
              <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2" />
                Client Guidelines
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    Must be admin-approved to host
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    Add items before auction starts
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    Cannot modify active auctions
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    Set clear participant limits
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">
                    Honor winning bids and complete sales
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <details className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow">
              <summary className="font-semibold text-gray-900 text-lg">
                Is registration free?
              </summary>
              <p className="mt-3 text-gray-600">
                Yes! Creating an account is completely free for both
                participants and clients. There are no hidden fees or
                subscription charges.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow">
              <summary className="font-semibold text-gray-900 text-lg">
                How long does client approval take?
              </summary>
              <p className="mt-3 text-gray-600">
                Client profiles are typically reviewed within 24-48 hours.
                You'll receive an email notification once approved. This ensures
                all auction hosts are verified and trustworthy.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow">
              <summary className="font-semibold text-gray-900 text-lg">
                Can I cancel a bid?
              </summary>
              <p className="mt-3 text-gray-600">
                No, bids are final once placed. This ensures fair bidding for
                all participants. Always review your bid amount before
                submitting.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow">
              <summary className="font-semibold text-gray-900 text-lg">
                What happens if I win an item?
              </summary>
              <p className="mt-3 text-gray-600">
                After the auction ends, you'll see your winning items in your
                dashboard. The auction host will contact you to complete the
                transaction securely.
              </p>
            </details>

            <details className="bg-white rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow">
              <summary className="font-semibold text-gray-900 text-lg">
                Can I host multiple auctions?
              </summary>
              <p className="mt-3 text-gray-600">
                Yes! Once approved as a client, you can create and manage
                multiple auctions simultaneously from your dashboard.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-primary-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <Star className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Join Vendly?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Whether you're bidding or hosting, Vendly makes auctions simple,
            transparent, and exciting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/register")}
            >
              Create Free Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/auctions")}
            >
              Explore Auctions
              <Search className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;
