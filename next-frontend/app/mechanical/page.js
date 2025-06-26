'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function MechanicalWork() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [formData, setFormData] = useState({
    vehicleType: '',
    vehicleNumber: '',
    issue: '',
    notes: '',
    image: null
  });
  const [error, setError] = useState('');
  const [availableMechanics, setAvailableMechanics] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [prices, setPrices] = useState({});

  const mechanicalIssues = [
    {
      value: 'dead_battery',
      label: 'Dead Battery',
      description: 'No power or ignition due to a drained or faulty battery.'
    },
    {
      value: 'flat_tyre',
      label: 'Flat Tyre or Puncture',
      description: 'Tyre is punctured or damaged, causing air loss.'
    },
    {
      value: 'overheating',
      label: 'Engine Overheating',
      description: 'Engine gets too hot, often from coolant leaks or radiator issues.'
    },
    {
      value: 'brake_issues',
      label: 'Brake Issues',
      description: 'Weak, noisy, or unresponsive brakes; may involve fluid leaks or worn pads.'
    },
    {
      value: 'starter_motor',
      label: 'Starter Motor Failure',
      description: 'Engine won\'t start even when battery is working.'
    },
    {
      value: 'clutch_gear',
      label: 'Clutch or Gear Malfunction',
      description: 'Difficulty shifting gears or unresponsive clutch.'
    },
    {
      value: 'electrical',
      label: 'Electrical Failures',
      description: 'Headlights, indicators, or wiring not functioning properly.'
    },
    {
      value: 'fluid_leak',
      label: 'Oil or Coolant Leakage',
      description: 'Fluid leaks under vehicle affecting performance.'
    },
    {
      value: 'chain_belt',
      label: 'Loose or Broken Chain/Belt',
      description: 'Especially in bikes, affects motion and control.'
    },
    {
      value: 'key_lockout',
      label: 'Key Lockout or Immobilizer Error',
      description: 'Locked out or error in anti-theft system disabling start.'
    }
  ];

  // Fetch mechanical issue prices
  useEffect(() => {
    fetch('http://localhost:8000/api/services/mechanical/prices/')
      .then(res => res.json())
      .then(data => setPrices(data));
  }, []);

  // Get current location and check available mechanics
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
              
              // Check available mechanics
              try {
                const response = await fetch('/api/services/mechanical/mechanics');
                const data = await response.json();
                setAvailableMechanics(data.mechanics);
              } catch (err) {
                console.error('Error checking mechanics:', err);
                setError('Unable to check available mechanics');
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!location) {
      setError('Please enable location services to continue');
      return;
    }

    if (!formData.vehicleType || !formData.vehicleNumber || !formData.issue) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'image' && formData[key]) {
          formDataToSend.append('image', formData[key]);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      formDataToSend.append('location', JSON.stringify(location));
      formDataToSend.append('serviceType', 'Mechanical Work');

      const response = await fetch('/api/services/mechanical', {
        method: 'POST',
        body: formDataToSend
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
  const getIssuePrice = () => {
    switch (formData.issue) {
      case 'dead_battery': return prices.price_dead_battery || 0;
      case 'flat_tyre': return prices.price_flat_tyre || 0;
      case 'overheating': return prices.price_overheating || 0;
      case 'brake_issues': return prices.price_brake_issues || 0;
      case 'starter_motor': return prices.price_starter_motor || 0;
      case 'clutch_gear': return prices.price_clutch_gear || 0;
      case 'electrical': return prices.price_electrical || 0;
      case 'fluid_leak': return prices.price_fluid_leak || 0;
      case 'chain_belt': return prices.price_chain_belt || 0;
      case 'key_lockout': return prices.price_key_lockout || 0;
      default: return 0;
    }
  };
  const total = getIssuePrice();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Getting your location and checking available mechanics...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mechanical Work Service</h1>
            <p className="text-gray-600">Quick roadside assistance for mechanical issues</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {availableMechanics !== null && (
            <div className="mb-6 bg-orange-50 border border-orange-400 text-orange-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">Available mechanics in your area: {availableMechanics}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Display */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-900">Current Location</p>
                  <p className="text-xs text-orange-700">
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
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
              >
                <option value="">Select vehicle type</option>
                <option value="car">Car</option>
                <option value="bike">Bike/Scooter</option>
                <option value="bus">Bus</option>
                <option value="truck">Truck</option>
                <option value="other">Other</option>
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
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
            </div>

            {/* Issue Selection */}
            <div>
              <label htmlFor="issue" className="block text-sm font-medium text-gray-700">
                Select Issue *
              </label>
              <select
                id="issue"
                name="issue"
                value={formData.issue}
                onChange={handleChange}
                required
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
              >
                <option value="">Select mechanical issue</option>
                {mechanicalIssues.map((issue) => (
                  <option key={issue.value} value={issue.value}>
                    {issue.label}
                  </option>
                ))}
              </select>
              {formData.issue && (
                <p className="mt-2 text-sm text-gray-500">
                  {mechanicalIssues.find(i => i.value === formData.issue)?.description}
                </p>
              )}
            </div>
            {/* Total Price Display */}
            <div className="mt-4 text-lg font-bold text-orange-700">
              Total: ₹{total}
            </div>

            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700">
                Upload Image of Issue (Optional)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="mb-4">
                      <img src={imagePreview} alt="Preview" className="mx-auto h-32 w-auto object-cover rounded-lg" />
                    </div>
                  ) : (
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="image" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                      <span>Upload a file</span>
                      <input
                        id="image"
                        name="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
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
                placeholder="Provide any additional details about the issue"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Request Mechanical Service
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
