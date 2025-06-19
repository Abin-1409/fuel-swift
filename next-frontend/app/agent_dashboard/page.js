'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function AgentDashboard() {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(true);
  const [notifications, setNotifications] = useState([]);
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

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate fetching dashboard data
    setStats({
      todayRequests: 12,
      ongoingTasks: 3,
      completedTasks: 9,
      earnings: {
        today: 1850,
        week: 12450,
        month: 48500
      },
      serviceBreakdown: {
        petrol: 4,
        diesel: 3,
        ev: 2,
        air: 1,
        mechanical: 2
      },
      responseTime: {
        average: 12,
        best: 8
      }
    });

    // Simulate real-time notifications
    const mockNotifications = [
      { 
        id: 1, 
        type: 'new_request', 
        message: 'New petrol delivery request in Sector 15', 
        time: '2 mins ago',
        priority: 'high',
        location: 'Sector 15, Gurgaon',
        distance: '2.5 km'
      },
      { 
        id: 2, 
        type: 'task_completed', 
        message: 'Diesel delivery completed successfully', 
        time: '15 mins ago',
        rating: 5,
        feedback: 'Excellent service!'
      },
      { 
        id: 3, 
        type: 'urgent', 
        message: 'Urgent mechanical assistance required nearby', 
        time: '25 mins ago',
        priority: 'critical',
        location: 'Sector 14, Gurgaon',
        distance: '1.8 km'
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
    // API call to update agent status
  };

  const handleRealtimeUpdate = (data) => {
    // Handle real-time updates from WebSocket
    if (data.type === 'new_request') {
      setNotifications(prev => [{
        id: Date.now(),
        type: 'new_request',
        message: data.message,
        time: 'Just now'
      }, ...prev]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agent Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, Agent #1234</p>
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
                <p className="text-xs text-gray-500 mt-1">+2 from yesterday</p>
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
                <p className="text-xs text-gray-500 mt-1">2 urgent requests</p>
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
                <p className="text-sm font-medium text-gray-600">Avg. Response Time</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.responseTime.average} mins</p>
                <p className="text-xs text-gray-500 mt-1">Best: {stats.responseTime.best} mins</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
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
                <p className="text-xs text-gray-500 mt-1">+₹250 from yesterday</p>
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
          {/* Notifications Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {notifications.length} new
                </span>
              </div>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className={`p-2 rounded-full ${
                      notification.type === 'new_request' ? 'bg-blue-100' :
                      notification.type === 'task_completed' ? 'bg-green-100' :
                      'bg-red-100'
                    }`}>
                      <svg className={`w-4 h-4 ${
                        notification.type === 'new_request' ? 'text-blue-600' :
                        notification.type === 'task_completed' ? 'text-green-600' :
                        'text-red-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                      {notification.location && (
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {notification.location} ({notification.distance})
                        </div>
                      )}
                      {notification.rating && (
                        <div className="flex items-center mt-1">
                          {[...Array(notification.rating)].map((_, i) => (
                            <svg key={i} className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Service Breakdown and Earnings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Service Types */}
                <div className="space-y-4">
                  {Object.entries(stats.serviceBreakdown).map(([service, count]) => (
                    <div key={service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full ${
                          service === 'petrol' ? 'bg-blue-100' :
                          service === 'diesel' ? 'bg-green-100' :
                          service === 'ev' ? 'bg-purple-100' :
                          service === 'air' ? 'bg-yellow-100' :
                          'bg-red-100'
                        }`}>
                          <svg className={`w-4 h-4 ${
                            service === 'petrol' ? 'text-blue-600' :
                            service === 'diesel' ? 'text-green-600' :
                            service === 'ev' ? 'text-purple-600' :
                            service === 'air' ? 'text-yellow-600' :
                            'text-red-600'
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

                {/* Earnings Overview */}
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Today's Earnings</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">₹{stats.earnings.today}</p>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-green-500 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">₹{stats.earnings.week}</p>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">₹{stats.earnings.month}</p>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full">
                      <div className="h-2 bg-purple-500 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="mt-8">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Accept New Task
                  </button>
                  <button className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors duration-200">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    View Performance
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
