'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ElectricCharging() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [formData, setFormData] = useState({
    vehicleType: '',
    vehicleNumber: '',
    chargerType: '',
    chargingRequirement: '',
    preferredTime: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [availableChargers, setAvailableChargers] = useState(null);
  const [prices, setPrices] = useState({});

  // Fetch EV charger prices
  useEffect(() => {
    fetch('http://localhost:8000/api/services/electric/prices/')
      .then(res => res.json())
      .then(data => setPrices(data));
  }, []);

  // Get current location and check available chargers
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
              
              // Check available chargers
              try {
                const response = await fetch('/api/services/electric/chargers');
                const data = await response.json();
                setAvailableChargers(data.chargers);
              } catch (err) {
                console.error('Error checking chargers:', err);
                setError('Unable to check available chargers');
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

    if (!formData.vehicleType || !formData.vehicleNumber || !formData.chargerType || !formData.chargingRequirement || !formData.preferredTime) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/services/electric', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          location,
          serviceType: 'EV Charging'
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

  // Calculate total price
  const getBasePrice = () => {
    switch (formData.chargerType) {
      case 'basic': return prices.price_basic || 0;
      case 'type2': return prices.price_type2 || 0;
      case 'ccs': return prices.price_ccs || 0;
      case 'chademo': return prices.price_chademo || 0;
      case 'bharat_dc': return prices.price_bharat_dc || 0;
      default: return 0;
    }
  };
  const getMultiplier = () => {
    switch (formData.chargingRequirement) {
      case 'emergency': return 1;
      case 'partial': return 1.5;
      case 'full': return 2;
      default: return 0;
    }
  };
  const total = getBasePrice() * getMultiplier();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Getting your location and checking available chargers...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency EV Charging Service</h1>
            <p className="text-gray-600">Mobile charging assistance for your electric vehicle</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {availableChargers !== null && (
            <div className="mb-6 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">Available mobile chargers in your area: {availableChargers}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Display */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">Current Location</p>
                  <p className="text-xs text-green-700">
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
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              >
                <option value="">Select vehicle type</option>
                <option value="ev_car">EV Car</option>
                <option value="ev_bike">EV Bike/Scooter</option>
                <option value="ev_auto">EV Auto Rickshaw</option>
              </select>
            </div>

            {/* Vehicle Number */}
            <div>
              <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700">
                Vehicle Number *
              </label>
              <input
                type="text"
                id="vehicleNumber"
                name="vehicleNumber"
                value={formData.vehicleNumber}
                onChange={handleChange}
                required
                placeholder="Enter vehicle registration number"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            {/* Charger Type */}
            <div>
              <label htmlFor="chargerType" className="block text-sm font-medium text-gray-700">
                Charger Type *
              </label>
              <select
                id="chargerType"
                name="chargerType"
                value={formData.chargerType}
                onChange={handleChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              >
                <option value="">Select charger type</option>
                <option value="basic">Basic (15A Socket)</option>
                <option value="type2">Type 2 (AC Charging)</option>
                <option value="ccs">CCS (DC Fast Charging)</option>
                <option value="chademo">CHAdeMO</option>
                <option value="bharat_dc">Bharat DC-001</option>
              </select>
            </div>

            {/* Charging Requirement */}
            <div>
              <label htmlFor="chargingRequirement" className="block text-sm font-medium text-gray-700">
                Estimated Charging Requirement *
              </label>
              <select
                id="chargingRequirement"
                name="chargingRequirement"
                value={formData.chargingRequirement}
                onChange={handleChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
              >
                <option value="">Select charging requirement</option>
                <option value="emergency">Emergency (Enough to reach nearest charging station)</option>
                <option value="partial">Partial Charge (50% of battery)</option>
                <option value="full">Full Charge (100% of battery)</option>
              </select>
            </div>

            {/* Preferred Time */}
            <div>
              <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700">
                Preferred Charging Time *
              </label>
              <input
                type="datetime-local"
                id="preferredTime"
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleChange}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
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
                placeholder="Any specific instructions or details about your vehicle"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>

            {/* Total Price Display */}
            <div className="mt-4 text-lg font-bold text-green-700">
              Total: ₹{total}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Request Emergency Charging
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
