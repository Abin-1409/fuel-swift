'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function AgentDashboard() {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [taskErrors, setTaskErrors] = useState({});
  const [agentEmail, setAgentEmail] = useState('');
  const [stats, setStats] = useState({
    todayRequests: 0,
    ongoingTasks: 0,
    completedTasks: 0,
    earnings: {
      today: 0,
      week: 0,
      month: 0
    },
    serviceBreakdown: {
      petrol: 0,
      diesel: 0,
      ev: 0,
      air: 0,
      mechanical: 0
    },
    responseTime: {
      average: 0,
      best: 0
    }
  });

  useEffect(() => {
    // Get agent email from localStorage
    const email = localStorage.getItem('userEmail');
    if (email) {
      setAgentEmail(email);
      fetchDashboardData(email);
      fetchAssignedTasks(email);
    } else {
      setError('Agent email not found. Please login again.');
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async (email) => {
    try {
      const response = await fetch(`http://localhost:8000/api/agent/dashboard-stats/?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        setStats({
          todayRequests: data.today_requests,
          ongoingTasks: data.ongoing_tasks,
          completedTasks: data.completed_tasks,
          earnings: {
            today: data.earnings.today,
            week: data.earnings.week,
            month: data.earnings.month
          },
          serviceBreakdown: data.service_breakdown,
          responseTime: data.response_time
        });
      } else {
        setError('Failed to fetch dashboard statistics');
      }
    } catch (err) {
      setError('Failed to fetch dashboard statistics');
    }
  };

  const fetchAssignedTasks = async (email) => {
    try {
      // Clear task-specific errors when refreshing tasks
      setTaskErrors({});
      
      const response = await fetch(`http://localhost:8000/api/agent/assigned-tasks/?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        setAssignedTasks(data);
        
        // Create notifications from recent tasks
        const recentTasks = data.slice(0, 5).map(task => ({
          id: task.id,
          type: 'new_request',
          message: `${task.service_type.toUpperCase()} request from ${task.user_name}`,
          time: new Date(task.created_at).toLocaleString(),
          priority: task.status === 'assigned' ? 'high' : 'normal',
          location: `Lat: ${task.location_lat}, Lng: ${task.location_lng}`,
          distance: '2.5 km', // Mock distance
          task: task
        }));
        setNotifications(recentTasks);
      } else {
        setError('Failed to fetch assigned tasks');
      }
    } catch (err) {
      setError('Failed to fetch assigned tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      // Clear any previous errors for this task
      setTaskErrors(prev => ({ ...prev, [taskId]: null }));
      
      const response = await fetch(`http://localhost:8000/api/agent/tasks/${taskId}/update-status/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_email: agentEmail,
          status: newStatus
        })
      });
      
      if (response.ok) {
        // Refresh tasks and stats
        await fetchAssignedTasks(agentEmail);
        await fetchDashboardData(agentEmail);
      } else {
        const errorData = await response.json();
        // Set error specific to this task
        setTaskErrors(prev => ({
          ...prev,
          [taskId]: errorData.message || 'Failed to update task status'
        }));
      }
    } catch (err) {
      // Set error specific to this task
      setTaskErrors(prev => ({
        ...prev,
        [taskId]: 'Failed to update task status'
      }));
    }
  };

  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
    // API call to update agent status
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceTypeColor = (serviceType) => {
    switch (serviceType) {
      case 'petrol': return 'bg-red-100 text-red-800';
      case 'diesel': return 'bg-green-100 text-green-800';
      case 'ev': return 'bg-purple-100 text-purple-800';
      case 'air': return 'bg-orange-100 text-orange-800';
      case 'mechanical': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading station dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <button 
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Station Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, {agentEmail}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                <span className={`w-3 h-3 rounded-full mr-2 ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className="text-sm font-medium text-gray-700">
                  {isAvailable ? 'Available' : 'Not Available'}
                </span>
              </div>
              <button
                onClick={toggleAvailability}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  isAvailable 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {isAvailable ? 'Go Offline' : 'Go Online'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Requests</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.todayRequests}</p>
                <p className="text-xs text-gray-500 mt-1">Assigned tasks</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ongoing Tasks</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.ongoingTasks}</p>
                <p className="text-xs text-gray-500 mt-1">In progress</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completedTasks}</p>
                <p className="text-xs text-gray-500 mt-1">This month</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Earnings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₹{stats.earnings.today}</p>
                <p className="text-xs text-gray-500 mt-1">From completed tasks</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assigned Tasks Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Assigned Tasks</h2>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {assignedTasks.length} tasks
                </span>
              </div>
              
              {assignedTasks.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-lg">No tasks assigned yet</div>
                  <div className="text-gray-500 text-sm mt-2">Admin will assign tasks to you</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getServiceTypeColor(task.service_type)}`}>
                            {task.service_type?.toUpperCase() || 'N/A'}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                            {task.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">₹{task.total_amount}</div>
                          <div className="text-xs text-gray-500">#{task.id}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-700">Customer:</span>
                          <span className="ml-2 text-gray-900">{task.user_name}</span>
                          <span className="ml-2 text-gray-500">({task.user_phone})</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-700">Vehicle:</span>
                          <span className="ml-2 text-gray-900">{task.vehicle_type} - {task.vehicle_number}</span>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-700">Location:</span>
                          <span className="ml-2 text-gray-900">Lat: {task.location_lat}, Lng: {task.location_lng}</span>
                        </div>
                        
                        {task.notes && (
                          <div className="flex items-start text-sm">
                            <span className="font-medium text-gray-700">Notes:</span>
                            <span className="ml-2 text-gray-900">{task.notes}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm">
                          <span className="font-medium text-gray-700">Payment:</span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                            task.payment_status === 'success' ? 'bg-green-100 text-green-800' :
                            task.payment_status === 'cod' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {task.payment_status?.toUpperCase() || 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex flex-col space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            Assigned: {new Date(task.created_at).toLocaleDateString()}
                          </div>
                          
                          <div className="flex space-x-2">
                            {task.status === 'cancelled' ? (
                              <span className="text-xs text-red-500 italic">Request cancelled - cannot update</span>
                            ) : (
                              <select
                                value={task.status || 'pending'}
                                onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                                className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="assigned">Assigned</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            )}
                          </div>
                        </div>
                        
                        {taskErrors[task.id] && (
                          <div className="text-xs text-red-500 bg-red-50 p-2 rounded-md">
                            Error: {taskErrors[task.id]}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Notifications and Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="space-y-6">
              {/* Recent Notifications */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {notifications.length} new
                  </span>
                </div>
                <div className="space-y-4">
                  {notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="p-2 rounded-full bg-blue-100">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Breakdown */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Breakdown</h2>
                <div className="space-y-4">
                  {Object.entries(stats.serviceBreakdown).map(([service, count]) => (
                    <div key={service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full ${
                          service === 'petrol' ? 'bg-red-100' :
                          service === 'diesel' ? 'bg-green-100' :
                          service === 'ev' ? 'bg-purple-100' :
                          service === 'air' ? 'bg-yellow-100' :
                          'bg-blue-100'
                        }`}>
                          <svg className={`w-4 h-4 ${
                            service === 'petrol' ? 'text-red-600' :
                            service === 'diesel' ? 'text-green-600' :
                            service === 'ev' ? 'text-purple-600' :
                            service === 'air' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-900 capitalize">{service}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Earnings Overview */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Earnings Overview</h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Today's Earnings</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">₹{stats.earnings.today}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">₹{stats.earnings.week}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">₹{stats.earnings.month}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
