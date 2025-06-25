'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function AirService() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [formData, setFormData] = useState({
    vehicleType: '',
    tyreCount: '',
    tyreType: '',
    leakDetection: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [availableTechnicians, setAvailableTechnicians] = useState(null);

  // Get current location and check available technicians
  useEffect(() => {
    const getLocation = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
              });
              
              // Check available technicians
              try {
                const response = await fetch('/api/services/air/technicians');
                const data = await response.json();
                setAvailableTechnicians(data.technicians);
              } catch (err) {
                console.error('Error checking technicians:', err);
                setError('Unable to check available technicians');
              }
              
              setLoading(false);
            },
            (error) => {
              console.error('Error getting location:', error);
              setError('Unable to get your location. Please enable location services.');
              setLoading(false);
            }
          );
        } else {
          setError('Geolocation is not supported by your browser');
          setLoading(false);
        }
      } catch (err) {
        setError('Error getting location');
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!location) {
      setError('Please enable location services to continue');
      return;
    }

    if (!formData.vehicleType || !formData.tyreCount || !formData.tyreType || !formData.leakDetection) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/services/air', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          location,
          serviceType: 'Air Service'
        }),
      });

      if (response.ok) {
        router.push('/confirmation');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to submit request');
      }
    } catch (err) {
      setError('An error occurred while submitting your request');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Getting your location and checking available technicians...</p>
          <p className="mt-2 text-gray-500 text-sm">Please enable location services</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tyre Air Service</h1>
            <p className="text-gray-600">Quick air refill and leak detection service</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {availableTechnicians !== null && (
            <div className="mb-6 bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">Available technicians in your area: {availableTechnicians}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Display */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-full">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-900">Current Location</p>
                  <p className="text-xs text-yellow-700">
                    {location ? `Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(6)}` : 'Location not available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicle Type */}
            <div>
              <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700">
                Vehicle Type *
              </label>
              <select
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md"
              >
                <option value="">Select vehicle type</option>
                <option value="car">Car</option>
                <option value="bike">Bike</option>
                <option value="bus">Bus</option>
                <option value="truck">Truck</option>
              </select>
            </div>

            {/* Number of Tyres */}
            <div>
              <label htmlFor="tyreCount" className="block text-sm font-medium text-gray-700">
                Number of Tyres to Refill *
              </label>
              <select
                id="tyreCount"
                name="tyreCount"
                value={formData.tyreCount}
                onChange={handleChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md"
              >
                <option value="">Select number of tyres</option>
                <option value="1">1 Tyre</option>
                <option value="2">2 Tyres</option>
                <option value="3">3 Tyres</option>
                <option value="4">4 Tyres</option>
                <option value="6">6 Tyres</option>
                <option value="8">8 Tyres</option>
              </select>
            </div>

            {/* Tyre Type */}
            <div>
              <label htmlFor="tyreType" className="block text-sm font-medium text-gray-700">
                Tyre Type *
              </label>
              <select
                id="tyreType"
                name="tyreType"
                value={formData.tyreType}
                onChange={handleChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md"
              >
                <option value="">Select tyre type</option>
                <option value="tubeless">Tubeless</option>
                <option value="tube">Tube</option>
              </select>
            </div>

            {/* Leak Detection */}
            <div>
              <label htmlFor="leakDetection" className="block text-sm font-medium text-gray-700">
                Leak Detection Required? *
              </label>
              <select
                id="leakDetection"
                name="leakDetection"
                value={formData.leakDetection}
                onChange={handleChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm rounded-md"
              >
                <option value="">Select option</option>
                <option value="yes">Yes, check for leaks</option>
                <option value="no">No, just air refill</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Specify which tyres need attention (e.g., front left flat, rear right low pressure)"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Request Air Service
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
