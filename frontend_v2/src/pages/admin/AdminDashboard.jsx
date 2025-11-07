import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import adminAPI from "../../api/adminAPI";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Navbar from "../../components/layouts/Navbar";
import { CheckCircle, XCircle, UserCheck, Users, Loader2 } from "lucide-react";

/**
 * Admin Dashboard - Manage client approvals
 *
 * Features:
 * - View pending client approval requests
 * - Approve client profiles
 * - Display client statistics
 * - Real-time updates
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const [pendingClients, setPendingClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  // Fetch pending clients on mount
  useEffect(() => {
    fetchPendingClients();
  }, []);

  const fetchPendingClients = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await adminAPI.getPendingClients();
      setPendingClients(data);
    } catch (err) {
      console.error("Failed to fetch pending clients:", err);
      setError("Failed to load pending clients. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      setApprovingId(userId);
      setError("");
      await adminAPI.approveClient(userId);

      // Remove approved client from the list
      setPendingClients(
        pendingClients.filter((client) => client.user_id !== userId)
      );

      // Show success feedback (you can add a toast notification here)
      console.log("Client approved successfully");
    } catch (err) {
      console.error("Failed to approve client:", err);
      setError("Failed to approve client. Please try again.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (userId) => {
    try {
      setRejectingId(userId);
      setError("");
      await adminAPI.rejectClient(userId);

      // Remove rejected client from the list
      setPendingClients(
        pendingClients.filter((client) => client.user_id !== userId)
      );

      // Show success feedback
      console.log("Client rejected successfully");
    } catch (err) {
      console.error("Failed to reject client:", err);
      setError("Failed to reject client. Please try again.");
    } finally {
      setRejectingId(null);
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
                Admin Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Welcome back,{" "}
                <span className="font-semibold">{user?.username}</span>
              </p>
            </div>
            <Badge variant="info">Admin</Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Pending Approvals
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingClients.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Approved Today
                </p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-amber-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Clients
                </p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Approvals Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Pending Client Approvals
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Review and approve client registration requests
            </p>
          </div>

          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                <span className="ml-3 text-gray-600">
                  Loading pending clients...
                </span>
              </div>
            ) : pendingClients.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  All Caught Up!
                </h3>
                <p className="text-gray-600">
                  No pending client approvals at the moment.
                </p>
              </div>
            ) : (
              /* Pending Clients Table */
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingClients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {client.username || (
                              <span className="text-gray-400 italic">N/A</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {client.email || (
                              <span className="text-gray-400 italic">N/A</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {client.company_name || (
                              <span className="text-gray-400 italic">
                                Not provided
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="warning">Pending Approval</Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleApprove(client.user_id)}
                              isLoading={approvingId === client.user_id}
                              disabled={
                                approvingId !== null || rejectingId !== null
                              }
                            >
                              {approvingId === client.user_id
                                ? "Approving..."
                                : "Approve"}
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleReject(client.user_id)}
                              isLoading={rejectingId === client.user_id}
                              disabled={
                                approvingId !== null || rejectingId !== null
                              }
                            >
                              {rejectingId === client.user_id
                                ? "Rejecting..."
                                : "Reject"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
