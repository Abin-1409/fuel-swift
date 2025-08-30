'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeServices: 0,
    pendingRequests: 0,
    revenue: 0
  });



  const [agentRequests, setAgentRequests] = useState([]);
  const [agentReqLoading, setAgentReqLoading] = useState(false);
  const [agentReqError, setAgentReqError] = useState("");
  const [agentReqSuccess, setAgentReqSuccess] = useState("");

  useEffect(() => {
    fetchAgentRequests();
  }, []);

  const fetchAgentRequests = async () => {
    setAgentReqLoading(true);
    setAgentReqError("");
    try {
      const res = await fetch("http://localhost:8000/api/agent-registration-requests/");
      if (res.ok) {
        const data = await res.json();
        setAgentRequests(data);
      } else {
        setAgentReqError("Failed to fetch agent registration requests.");
      }
    } catch (err) {
      setAgentReqError("Failed to fetch agent registration requests.");
    }
    setAgentReqLoading(false);
  };

  const handleAcceptAgent = async (id) => {
    setAgentReqError("");
    setAgentReqSuccess("");
    try {
      const res = await fetch(`http://localhost:8000/api/agent-registration-request/${id}/accept/`, {
        method: "POST",
      });
      if (res.ok) {
        setAgentReqSuccess("Agent registration accepted and user created.");
        setAgentRequests((prev) => prev.filter((req) => req.id !== id));
      } else {
        const data = await res.json();
        setAgentReqError(data.message || "Failed to accept agent registration.");
      }
    } catch (err) {
      setAgentReqError("Failed to accept agent registration.");
    }
  };

  const handleRejectAgent = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/agent-registration-request/${id}/reject/`, {
        method: 'POST',
      });
      if (res.ok) {
        setAgentReqSuccess('Agent registration rejected.');
        setAgentRequests((prev) => prev.filter((r) => r.id !== id));
      } else {
        const data = await res.json();
        setAgentReqError(data.message || 'Failed to reject agent registration.');
      }
    } catch (err) {
      setAgentReqError('Failed to reject agent registration.');
    }
  };

  const handleServiceSettings = () => {
    router.push('/service_management');
  };

  const handleManageUsers = () => {
    router.push('/user_list');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
            <div className="mt-4 flex items-center text-blue-100 text-sm">
              <span className="text-gray-300">No data available</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Services</p>
                <p className="text-3xl font-bold">{stats.activeServices}</p>
              </div>
              <div className="text-4xl">⚡</div>
            </div>
            <div className="mt-4 flex items-center text-green-100 text-sm">
              <span className="text-gray-300">No data available</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Pending Requests</p>
                <p className="text-3xl font-bold">{stats.pendingRequests}</p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
            <div className="mt-4 flex items-center text-yellow-100 text-sm">
              <span className="text-gray-300">No data available</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Revenue</p>
                <p className="text-3xl font-bold">${stats.revenue.toLocaleString()}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
            <div className="mt-4 flex items-center text-purple-100 text-sm">
              <span className="text-gray-300">No data available</span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Statistics */}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-8 bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-gray-700"
        >
          <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={handleManageUsers}
              className="p-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors border border-blue-500/30 cursor-pointer"
            >
              <div className="text-2xl mb-2">👥</div>
              <p className="text-sm font-medium">Manage Users</p>
            </button>
            <button 
              onClick={handleServiceSettings}
              className="p-4 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg transition-colors border border-green-500/30 cursor-pointer"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <p className="text-sm font-medium">Service Settings</p>
            </button>
            <button 
              onClick={() => router.push('/agent_list')}
              className="p-4 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors border border-orange-500/30 cursor-pointer"
            >
              <div className="text-2xl mb-2">🛡️</div>
              <p className="text-sm font-medium">Registered Agents</p>
            </button>
            <button 
              onClick={() => router.push('/request_management')}
              className="p-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors border border-purple-500/30 cursor-pointer"
            >
              <div className="text-2xl mb-2">📋</div>
              <p className="text-sm font-medium">Request Management</p>
            </button>
          </div>
        </motion.div>

        {/* Pending Agent Registrations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="mt-8 bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-gray-700"
        >
          <h2 className="text-xl font-bold text-white mb-6">Pending Agent Registrations</h2>
          {agentReqLoading && <div className="text-blue-200 mb-4">Loading...</div>}
          {agentReqError && <div className="text-red-300 mb-4">{agentReqError}</div>}
          {agentReqSuccess && <div className="text-green-300 mb-4">{agentReqSuccess}</div>}
          {agentRequests.length === 0 && !agentReqLoading && (
            <div className="text-gray-300">No pending agent registrations.</div>
          )}
          <div className="space-y-4">
            {agentRequests.map((req) => (
              <div key={req.id} className="bg-gray-800/50 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-white font-semibold">{req.full_name}</p>
                  <p className="text-gray-300 text-sm">Phone: {req.phone_number}</p>
                  <p className="text-gray-300 text-sm">Email: {req.email}</p>
                  <p className="text-gray-300 text-sm">ID Proof: {req.id_proof_type} ({req.id_proof_number})</p>
                  {req.id_proof_file && (
                    <a
                      href={req.id_proof_file.startsWith('http')
                        ? req.id_proof_file
                        : `http://localhost:8000${req.id_proof_file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 underline text-xs mt-1 inline-block"
                    >
                      View ID Proof
                    </a>
                  )}
                  <p className="text-gray-400 text-xs mt-1">Requested: {new Date(req.created_at).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => handleAcceptAgent(req.id)}
                  className="mt-4 md:mt-0 md:ml-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRejectAgent(req.id)}
                  className="mt-4 md:mt-0 md:ml-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Reject
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
