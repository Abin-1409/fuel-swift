// pages/index.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
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

  const features = [
    {
      title: 'Emergency Fuel Delivery',
      description: 'Get fuel delivered to your location when you run out of gas. No more pushing your vehicle to the nearest station.',
      icon: '⛽',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'EV Charging',
      description: 'Mobile electric vehicle charging service for when you need a quick power boost on the go.',
      icon: '🔌',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Air Filling',
      description: 'Professional tire inflation service to ensure your vehicle\'s optimal performance and safety.',
      icon: '💨',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Mechanical Support',
      description: 'On-site mechanical assistance for minor repairs and maintenance when you need it most.',
      icon: '🔧',
      color: 'from-orange-500 to-orange-600'
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
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-white"
          >
            <h1 className="text-5xl sm:text-7xl font-bold mb-8 leading-tight">
              Never Get Stranded Again
            </h1>
            <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto mb-12 leading-relaxed">
              FuelSwift brings emergency fuel delivery and vehicle services right to your location. 
              Fast, reliable, and convenient solutions for all your roadside needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => router.push('/service')}
                className="px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Services
              </button>
              <button
                onClick={() => router.push('/register')}
                className="px-10 py-4 bg-transparent text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300 border-2 border-white shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Sign Up Now
              </button>
            </div>
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive roadside assistance services to keep you moving, no matter what.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-gray-100"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white text-3xl flex items-center justify-center mb-6 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-white"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-8">
              Ready to Experience Hassle-Free Roadside Assistance?
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-12 leading-relaxed">
              Join thousands of satisfied customers who trust FuelSwift for their emergency vehicle needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => router.push('/register')}
                className="px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Sign Up Now
              </button>
              <button
                onClick={() => router.push('/login')}
                className="px-10 py-4 bg-transparent text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300 border-2 border-white shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Login
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">FuelSwift</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Your trusted partner for emergency roadside assistance and fuel delivery services.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6">Quick Links</h3>
              <ul className="space-y-4">
                <li><Link href="/" className="text-gray-400 hover:text-white text-lg transition-colors duration-300">Home</Link></li>
                <li><Link href="/service" className="text-gray-400 hover:text-white text-lg transition-colors duration-300">Services</Link></li>
                <li><Link href="/login" className="text-gray-400 hover:text-white text-lg transition-colors duration-300">Login</Link></li>
                <li><Link href="/register" className="text-gray-400 hover:text-white text-lg transition-colors duration-300">Register</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6">Contact Us</h3>
              <ul className="space-y-4 text-gray-400 text-lg">
                <li className="flex items-center space-x-3">
                  <span>📧</span>
                  <span>support@fuelswift.com</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span>📞</span>
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span>⏰</span>
                  <span>24/7 Emergency Support</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-lg">&copy; {new Date().getFullYear()} FuelSwift. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}