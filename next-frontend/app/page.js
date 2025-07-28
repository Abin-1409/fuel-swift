// pages/index.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      title: 'Premium Fuel Delivery',
      description: 'Experience luxury-grade fuel delivery with our state-of-the-art mobile units. Available 24/7 for your convenience.',
      icon: '⛽',
      color: 'from-blue-500 to-blue-600',
      gradient: 'from-blue-400/20 to-blue-600/20',
      stats: ['99.9% Purity', '24/7 Service', 'Premium Quality']
    },
    {
      title: 'Elite EV Charging',
      description: 'Cutting-edge mobile charging solutions for your electric vehicle. Fast, efficient, and environmentally conscious.',
      icon: '🔌',
      color: 'from-green-500 to-green-600',
      gradient: 'from-green-400/20 to-green-600/20',
      stats: ['Fast Charging', 'Smart Monitoring', 'Eco-Friendly']
    },
    {
      title: 'Precision Air Service',
      description: 'Professional tire care with advanced pressure monitoring systems. Ensuring optimal performance and safety.',
      icon: '💨',
      color: 'from-purple-500 to-purple-600',
      gradient: 'from-purple-400/20 to-purple-600/20',
      stats: ['Precision Control', 'Safety First', 'Expert Service']
    },
    {
      title: 'Premium Mechanical Care',
      description: 'Elite mechanical assistance with certified professionals. Comprehensive care for your vehicle.',
      icon: '🔧',
      color: 'from-orange-500 to-orange-600',
      gradient: 'from-orange-400/20 to-orange-600/20',
      stats: ['Expert Technicians', 'Quality Parts', 'Premium Service']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/50"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-6xl lg:text-8xl font-bold mb-8 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 heading-responsive"
            >
              AutoNest
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg sm:text-2xl lg:text-3xl text-blue-100 max-w-3xl mx-auto mb-12 leading-relaxed text-responsive"
            >
              Elevating Your Journey with Roadside Excellence
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <button
                onClick={() => router.push('/service')}
                className="group px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden"
              >
                <span className="relative z-10">Explore Services</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button
                onClick={() => router.push('/register')}
                className="group px-10 py-4 bg-transparent text-white rounded-xl font-bold text-lg transition-all duration-300 border-2 border-white/30 hover:border-white shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden"
              >
                <span className="relative z-10">Join Elite</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
          >
            <motion.div
              animate={{
                y: [0, 12, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-1 h-3 bg-white/50 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 heading-responsive">
              Premium Services
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto text-responsive">
              Experience excellence in every aspect of our  roadside assistance services.
            </p>
          </motion.div>

          <div className="responsive-grid">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                onHoverStart={() => setActiveFeature(index)}
                onHoverEnd={() => setActiveFeature(null)}
                className={`relative rounded-2xl p-6 sm:p-8 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer card-enhanced
                  ${activeFeature === index ? 'shadow-2xl' : 'shadow-xl'} 
                  bg-gradient-to-br ${feature.gradient} border border-white/20 backdrop-blur-sm`}
              >
                <div className="flex items-start space-x-6">
                  <motion.div 
                    animate={{ 
                      scale: activeFeature === index ? 1.1 : 1,
                      rotate: activeFeature === index ? 5 : 0
                    }}
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white text-3xl flex items-center justify-center shadow-lg`}
                  >
                    {feature.icon}
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 text-lg leading-relaxed mb-6">{feature.description}</p>
                    <div className="flex flex-wrap gap-3">
                      {feature.stats.map((stat, idx) => (
                        <motion.span
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="px-4 py-2 bg-white/50 rounded-full text-sm font-medium text-gray-700"
                        >
                          {stat}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-white"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Join the Elite Circle
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-12 leading-relaxed">
              Experience roadside assistance like never before. Join our exclusive community of discerning drivers.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => router.push('/register')}
                className="group px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden"
              >
                <span className="relative z-10">Become a Member</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button
                onClick={() => router.push('/login')}
                className="group px-10 py-4 bg-transparent text-white rounded-xl font-bold text-lg transition-all duration-300 border-2 border-white/30 hover:border-white shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden"
              >
                <span className="relative z-10">Access Portal</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">AutoNest</h3>
              <p className="text-gray-400 text-lg leading-relaxed">
                Elevating the standards of premium roadside assistance with unmatched excellence.
              </p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6 text-white">Quick Links</h3>
              <ul className="space-y-4">
                <li><Link href="/" className="text-gray-400 hover:text-white text-lg transition-colors duration-300">Home</Link></li>
                <li><Link href="/service" className="text-gray-400 hover:text-white text-lg transition-colors duration-300">Services</Link></li>
                <li><Link href="/login" className="text-gray-400 hover:text-white text-lg transition-colors duration-300">Login</Link></li>
                <li><Link href="/register" className="text-gray-400 hover:text-white text-lg transition-colors duration-300">Register</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6 text-white">Contact Us</h3>
              <ul className="space-y-4 text-gray-400 text-lg">
                <li className="flex items-center space-x-3">
                  <span>📧</span>
                  <span>elite@autonest.com</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span>📞</span>
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span>⏰</span>
                  <span>24/7 Elite Support</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400 text-lg">&copy; {new Date().getFullYear()} AutoNest. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}