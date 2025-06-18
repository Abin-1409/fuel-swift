// pages/index.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ServiceSelection() {
  const router = useRouter();
  const [stock, setStock] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock stock data - replace with actual API call
  useEffect(() => {
    const fetchStock = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setStock({
        petrol: 850,  // liters available
        diesel: 620,  // liters available
        ev: 4,        // available charging stations
        air: 2,       // available air pumps
        mechanical: 3 // available mechanics
      });
      setLastUpdated(new Date());
      setLoading(false);
    };

    fetchStock();
    
    // Real implementation would have interval for live updates
    const interval = setInterval(fetchStock, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleServiceSelect = (service) => {
    // Check stock availability
    const isAvailable = {
      petrol: stock.petrol > 100,
      diesel: stock.diesel > 100,
      ev: stock.ev > 0,
      air: stock.air > 0,
      mechanical: stock.mechanical > 0
    };

    if (isAvailable[service]) {
      router.push(`/request?service=${service}`);
    } else {
      alert(`${service.charAt(0).toUpperCase() + service.slice(1)} service is currently unavailable`);
    }
  };

  // Service configuration
  const services = [
    { 
      id: 'petrol',
      name: 'Petrol',
      icon: '⛽',
      description: 'Fuel delivery for petrol vehicles',
      minStock: 100,
      unit: 'liters',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'diesel',
      name: 'Diesel',
      icon: '⛽',
      description: 'Fuel delivery for diesel vehicles',
      minStock: 100,
      unit: 'liters',
      color: 'from-green-500 to-green-600'
    },
    { 
      id: 'ev',
      name: 'EV Charging',
      icon: '🔌',
      description: 'Mobile electric vehicle charging',
      minStock: 1,
      unit: 'stations',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      id: 'air',
      name: 'Air Filling',
      icon: '💨',
      description: 'Tire inflation service',
      minStock: 1,
      unit: 'pumps',
      color: 'from-orange-500 to-orange-600'
    },
    { 
      id: 'mechanical',
      name: 'Mechanical Work',
      icon: '🔧',
      description: 'On-site vehicle repair and maintenance',
      minStock: 1,
      unit: 'mechanics',
      color: 'from-red-500 to-red-600'
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
            Select Your Service
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Real-time availability shown below. Services are only available when sufficient stock is present.
          </p>
          <div className="mt-4 text-sm text-gray-500 flex items-center justify-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => {
            const currentStock = stock[service.id] || 0;
            const isAvailable = currentStock >= service.minStock;
            const stockPercentage = Math.min(Math.round((currentStock / (service.minStock * 2)) * 100), 100);

            return (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleServiceSelect(service.id)}
                className={`relative rounded-2xl p-6 shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer
                  ${isAvailable 
                    ? 'bg-white hover:shadow-xl border-2 border-transparent hover:border-blue-500' 
                    : 'bg-gray-100 opacity-75'} backdrop-blur-sm backdrop-filter`
                }
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-4 rounded-xl bg-gradient-to-br ${service.color} text-white text-3xl shadow-lg transform hover:scale-110 transition-transform duration-300`}>
                    {service.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1 text-sm">{service.description}</p>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-700 mb-1">
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
          className="mt-12 text-center text-gray-500 text-sm bg-white/50 backdrop-blur-sm p-4 rounded-xl max-w-3xl mx-auto shadow-sm"
        >
          <p className="font-medium">Stock levels update in real-time. Minimum stock requirements:</p>
          <p className="mt-1 text-xs">Petrol/Diesel: 100+ liters | EV: 1+ station | Air: 1+ pump | Mechanical: 1+ mechanic</p>
        </motion.div>
      </div>
    </div>
  );
}