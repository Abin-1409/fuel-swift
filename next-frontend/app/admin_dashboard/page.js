'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 1247,
    activeServices: 8,
    pendingRequests: 23,
    revenue: 45678
  });

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, user: 'John Doe', action: 'Requested Petrol Service', time: '2 minutes ago', status: 'pending' },
    { id: 2, user: 'Jane Smith', action: 'Completed EV Charging', time: '15 minutes ago', status: 'completed' },
    { id: 3, user: 'Mike Johnson', action: 'Cancelled Diesel Service', time: '1 hour ago', status: 'cancelled' },
    { id: 4, user: 'Sarah Wilson', action: 'Requested Mechanical Work', time: '2 hours ago', status: 'pending' },
    { id: 5, user: 'David Brown', action: 'Completed Air Filling', time: '3 hours ago', status: 'completed' }
  ]);

  const [serviceStats, setServiceStats] = useState([
    { name: 'Petrol', requests: 45, revenue: 12500, color: 'from-blue-500 to-blue-600' },
    { name: 'Diesel', requests: 32, revenue: 8900, color: 'from-green-500 to-green-600' },
    { name: 'EV Charging', requests: 28, revenue: 7200, color: 'from-purple-500 to-purple-600' },
    { name: 'Air Filling', requests: 19, revenue: 3800, color: 'from-orange-500 to-orange-600' },
    { name: 'Mechanical', requests: 15, revenue: 4200, color: 'from-red-500 to-red-600' }
  ]);

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
              <span className="text-green-300">↗ +12%</span>
              <span className="ml-2">from last month</span>
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
              <span className="text-green-300">↗ +2</span>
              <span className="ml-2">new this week</span>
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
              <span className="text-yellow-300">↘ -5</span>
              <span className="ml-2">from yesterday</span>
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
              <span className="text-green-300">↗ +8%</span>
              <span className="ml-2">from last week</span>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Statistics */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-gray-700"
          >
            <h2 className="text-xl font-bold text-white mb-6">Service Performance</h2>
            <div className="space-y-4">
              {serviceStats.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${service.color}`}></div>
                    <div>
                      <p className="text-white font-medium">{service.name}</p>
                      <p className="text-gray-400 text-sm">{service.requests} requests</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">${service.revenue.toLocaleString()}</p>
                    <p className="text-gray-400 text-sm">Revenue</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-gray-700"
          >
            <h2 className="text-xl font-bold text-white mb-6">Recent Activities</h2>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="p-4 bg-gray-800/50 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-medium">{activity.user}</p>
                      <p className="text-gray-400 text-sm">{activity.action}</p>
                      <p className="text-gray-500 text-xs mt-1">{activity.time}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                      activity.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
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
            <button className="p-4 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors border border-purple-500/30">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm font-medium">View Reports</p>
            </button>
            <button className="p-4 bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-lg transition-colors border border-orange-500/30">
              <div className="text-2xl mb-2">🔔</div>
              <p className="text-sm font-medium">Notifications</p>
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
                    <a href={`http://localhost:8000/media/${req.id_proof_file}`} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline text-xs mt-1 inline-block">View ID Proof</a>
                  )}
                  <p className="text-gray-400 text-xs mt-1">Requested: {new Date(req.created_at).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => handleAcceptAgent(req.id)}
                  className="mt-4 md:mt-0 md:ml-6 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
