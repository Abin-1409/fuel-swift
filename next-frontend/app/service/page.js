// pages/index.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function ServiceSelection() {
  const router = useRouter();
  const [stock, setStock] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [selectedService, setSelectedService] = useState(null);
  const [hoveredService, setHoveredService] = useState(null);

  // Mock stock data - replace with actual API call
  useEffect(() => {
    const fetchStock = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setStock({
        petrol: 850,
        diesel: 620,
        ev: 4,
        air: 2,
        mechanical: 3
      });
      setLastUpdated(new Date());
      setLoading(false);
    };

    fetchStock();
    const interval = setInterval(fetchStock, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleServiceSelect = (service) => {
    const isAvailable = {
      petrol: stock.petrol > 100,
      diesel: stock.diesel > 100,
      ev: stock.ev > 0,
      air: stock.air > 0,
      mechanical: stock.mechanical > 0
    };

    if (isAvailable[service]) {
      setSelectedService(service);
      setTimeout(() => {
        switch (service) {
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
            router.push('/request?service=' + service);
        }
      }, 500);
    } else {
      alert(`${service.charAt(0).toUpperCase() + service.slice(1)} service is currently unavailable`);
    }
  };

  const services = [
    { 
      id: 'petrol',
      name: 'Petrol',
      icon: '⛽',
      description: 'Fuel delivery for petrol vehicles',
      minStock: 100,
      unit: 'liters',
      color: 'from-blue-500 to-blue-600',
      gradient: 'from-blue-400/20 to-blue-600/20',
      features: ['24/7 Delivery', 'Quality Assured', 'Quick Service']
    },
    { 
      id: 'diesel',
      name: 'Diesel',
      icon: '⛽',
      description: 'Fuel delivery for diesel vehicles',
      minStock: 100,
      unit: 'liters',
      color: 'from-green-500 to-green-600',
      gradient: 'from-green-400/20 to-green-600/20',
      features: ['Bulk Delivery', 'Quality Check', 'Fast Response']
    },
    { 
      id: 'ev',
      name: 'EV Charging',
      icon: '🔌',
      description: 'Mobile electric vehicle charging',
      minStock: 1,
      unit: 'stations',
      color: 'from-purple-500 to-purple-600',
      gradient: 'from-purple-400/20 to-purple-600/20',
      features: ['Fast Charging', 'Multiple Ports', 'Smart Monitoring']
    },
    { 
      id: 'air',
      name: 'Air Filling',
      icon: '💨',
      description: 'Tire inflation service',
      minStock: 1,
      unit: 'pumps',
      color: 'from-orange-500 to-orange-600',
      gradient: 'from-orange-400/20 to-orange-600/20',
      features: ['Precision Filling', 'Leak Detection', '24/7 Service']
    },
    { 
      id: 'mechanical',
      name: 'Mechanical Work',
      icon: '🔧',
      description: 'On-site vehicle repair and maintenance',
      minStock: 1,
      unit: 'mechanics',
      color: 'from-red-500 to-red-600',
      gradient: 'from-red-400/20 to-red-600/20',
      features: ['Expert Mechanics', 'Quick Response', 'Quality Parts']
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Checking service availability...</p>
          <p className="mt-2 text-gray-500 text-sm">This may take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            Roadside Assistance Services
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Choose from our range of professional roadside assistance services
          </p>
          <div className="mt-4 text-sm text-gray-500 flex items-center justify-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const currentStock = stock[service.id] || 0;
            const isAvailable = currentStock >= service.minStock;
            const stockPercentage = Math.min(Math.round((currentStock / (service.minStock * 2)) * 100), 100);
            const isHovered = hoveredService === service.id;

            return (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onHoverStart={() => setHoveredService(service.id)}
                onHoverEnd={() => setHoveredService(null)}
                onClick={() => handleServiceSelect(service.id)}
                className={`relative rounded-2xl p-6 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer
                  ${isAvailable 
                    ? `bg-gradient-to-br ${service.gradient} hover:shadow-2xl border-2 border-transparent hover:border-${service.color.split('-')[1]}-500` 
                    : 'bg-gray-100 opacity-75'} backdrop-blur-sm backdrop-filter`
                }
              >
                <div className="flex items-start space-x-4">
                  <motion.div 
                    animate={{ 
                      scale: isHovered ? 1.1 : 1,
                      rotate: isHovered ? 5 : 0
                    }}
                    className={`p-4 rounded-xl bg-gradient-to-br ${service.color} text-white text-3xl shadow-lg`}
                  >
                    {service.icon}
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                      <motion.span 
                        animate={{ 
                          scale: isHovered ? 1.1 : 1,
                          backgroundColor: isAvailable ? '#10B981' : '#EF4444'
                        }}
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                      >
                        {isAvailable ? 'Available' : 'Unavailable'}
                      </motion.span>
                    </div>
                    <p className="text-gray-600 mt-1 text-sm">{service.description}</p>
                    
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between text-xs text-gray-700">
                        <span className="font-medium">Current stock:</span>
                        <span className="font-medium">{currentStock} {service.unit}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${stockPercentage}%` }}
                          transition={{ duration: 0.5 }}
                          className={`h-2 rounded-full ${
                            stockPercentage > 70 ? 'bg-green-500' : 
                            stockPercentage > 30 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        ></motion.div>
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
                          {service.features.map((feature, idx) => (
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

                {!isAvailable && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-2xl backdrop-blur-sm"
                  >
                    <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium text-sm">
                      Check back later
                    </span>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          // className="mt-12 text-center text-gray-500 text-sm bg-white/50 backdrop-blur-sm p-6 rounded-xl max-w-3xl mx-auto shadow-sm"
        >
          {/* <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              <span>Available</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
              <span>Unavailable</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
              <span>Low Stock</span>
            </div>
          </div> */}
        </motion.div>
      </div>
    </div>
  );
}