import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import HowItWorksPage from "./pages/HowItWorksPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AuctionsPage from "./pages/AuctionsPage";
import AuctionDetailsPage from "./pages/AuctionDetailsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ClientDashboard from "./pages/client/ClientDashboard";
import CreateAuction from "./pages/client/CreateAuction";
import AddAuctionItems from "./pages/client/AddAuctionItems";
import ManageAuction from "./pages/client/ManageAuction";
import ParticipantDashboard from "./pages/participant/ParticipantDashboard";
import LiveAuctionPage from "./pages/participant/LiveAuctionPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auctions" element={<AuctionsPage />} />
          <Route path="/auctions/:auctionId" element={<AuctionDetailsPage />} />

          {/* Admin Routes - Protected */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Client Routes - Protected */}
          <Route
            path="/client/dashboard"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/create-auction"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <CreateAuction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/auctions/:auctionId/items/add"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <AddAuctionItems />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/auctions/:auctionId/manage"
            element={
              <ProtectedRoute allowedRoles={["client"]}>
                <ManageAuction />
              </ProtectedRoute>
            }
          />

          {/* Participant Routes - Protected */}
          <Route
            path="/participant/dashboard"
            element={
              <ProtectedRoute allowedRoles={["participant"]}>
                <ParticipantDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/participant/auctions/:auctionId/live"
            element={
              <ProtectedRoute allowedRoles={["participant"]}>
                <LiveAuctionPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
