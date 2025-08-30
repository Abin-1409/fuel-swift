// pages/index.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import Notification from '../components/Notification';

export default function ServiceSelection() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState(null);
  const [hoveredService, setHoveredService] = useState(null);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });

  const API_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    }
  }, []);

  // Fetch services from backend
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/services/`);
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      const data = await response.json();
      // Filter only active services
      const activeServices = data.filter(service => service.status === 'active');
      setServices(activeServices);
    } catch (err) {
      setError('Failed to load services. Please try again later.');
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleServiceSelect = (service) => {
    if (typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true') {
      setSelectedService(service);
      setTimeout(() => {
        switch (service.type) {
          case 'petrol':
            router.push('/petrol_service');
            break;
          case 'diesel':
            router.push('/diesel_service');
            break;
          case 'ev':
            router.push('/electric');
            break;
          case 'air':
            router.push('/air');
            break;
          case 'mechanical':
            router.push('/mechanical');
            break;
          default:
            router.push('/request?service=' + service.type);
        }
      }, 500);
    } else {
      setError('Please log in to access this service.');
      setNotification({
        show: true,
        message: 'Please log in to access this service.',
        type: 'warning'
      });
      setTimeout(() => {
        setError('');
        router.push('/login');
      }, 1500); // Show error for 1.5 seconds, then redirect
    }
  };

  // Get service styling based on type
  const getServiceStyling = (type) => {
    const styling = {
      petrol: {
        icon: '⛽',
        color: 'from-blue-500 to-blue-600',
        gradient: 'from-blue-400/20 to-blue-600/20',
        features: ['24/7 Delivery', 'Quality Assured', 'Quick Service']
      },
      diesel: {
        icon: '⛽',
        color: 'from-green-500 to-green-600',
        gradient: 'from-green-400/20 to-green-600/20',
        features: ['Bulk Delivery', 'Quality Check', 'Fast Response']
      },
      ev: {
        icon: '🔌',
        color: 'from-purple-500 to-purple-600',
        gradient: 'from-purple-400/20 to-purple-600/20',
        features: ['Fast Charging', 'Multiple Ports', 'Smart Monitoring']
      },
      air: {
        icon: '💨',
        color: 'from-orange-500 to-orange-600',
        gradient: 'from-orange-400/20 to-orange-600/20',
        features: ['Precision Filling', 'Leak Detection', '24/7 Service']
      },
      mechanical: {
        icon: '🔧',
        color: 'from-red-500 to-red-600',
        gradient: 'from-red-400/20 to-red-600/20',
        features: ['Expert Mechanics', 'Quick Response', 'Quality Parts']
      }
    };
    return styling[type] || {
      icon: '⚙️',
      color: 'from-gray-500 to-gray-600',
      gradient: 'from-gray-400/20 to-gray-600/20',
      features: ['Professional Service', 'Quality Assured']
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner 
          size="large" 
          variant="default" 
          message="Loading services..."
          showMessage={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Notification Component */}
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.show}
          onClose={() => setNotification({ ...notification, show: false })}
        />
        
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4 heading-responsive">
            Roadside Assistance Services
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg text-responsive">
            Choose from our range of professional roadside assistance services
          </p>
        </motion.header>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 text-center max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {services.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No services available at the moment. Please check back later.</p>
          </div>
        )}

        <div className="responsive-grid max-w-6xl mx-auto">
          {services.map((service, index) => {
            const isHovered = hoveredService === service.id;
            const styling = getServiceStyling(service.type);
            
            return (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onHoverStart={() => setHoveredService(service.id)}
                onHoverEnd={() => setHoveredService(null)}
                onClick={() => handleServiceSelect(service)}
                className={`relative rounded-2xl p-6 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer card-enhanced
                  bg-gradient-to-br ${styling.gradient} hover:shadow-2xl border-2 border-transparent hover:border-${styling.color.split('-')[1]}-500 backdrop-blur-sm backdrop-filter`
                }
              >
                <div className="flex items-start space-x-4">
                  <motion.div 
                    animate={{ 
                      scale: isHovered ? 1.1 : 1,
                      rotate: isHovered ? 5 : 0
                    }}
                    className={`p-4 rounded-xl bg-gradient-to-br ${styling.color} text-white text-3xl shadow-lg`}
                  >
                    {styling.icon}
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                    </div>
                    <p className="text-gray-600 mt-1 text-sm">{service.description}</p>
                    
                    {/* Service Charge Display */}
                    <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-800">Service Charge:</span>
                        <span className="text-sm font-bold text-blue-900">₹{service.service_charge || 0}</span>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 space-y-2"
                        >
                          {styling.features.map((feature, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="flex items-center text-sm text-gray-600"
                            >
                              <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              {feature}
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}