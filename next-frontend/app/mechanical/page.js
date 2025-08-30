'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import RazorpayButton from '../components/RazorpayButton';
import Notification from '../components/Notification';

export default function MechanicalWork() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [formData, setFormData] = useState({
    vehicleType: '',
    vehicleNumber: '',
    issue: '',
    notes: '',
    image: null,
    deliveryTime: ''
  });
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [prices, setPrices] = useState({});
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const [orderId, setOrderId] = useState(null); // For Razorpay order
  const [paymentId, setPaymentId] = useState(null); // Our Payment model ID
  const [realAmount, setRealAmount] = useState(null); // Amount from backend
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userEmail = typeof window !== 'undefined' ? (localStorage.getItem('userEmail') || '').trim().toLowerCase() : '';

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
    setIsSubmitting(true);

    if (!location) {
      setError('Please enable location services to continue');
      return;
    }

    if (!formData.vehicleType || !formData.vehicleNumber || !formData.issue) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const requestData = {
        service_type: 'mechanical',
        user_email: userEmail,
        vehicle_type: formData.vehicleType,
        vehicle_number: formData.vehicleNumber,
        issue: formData.issue,
        notes: formData.notes,
        location_lat: location.lat,
        location_lng: location.lng,
        total_amount: total,
        delivery_time: formData.deliveryTime
      };
      console.log('DEBUG: Submitting requestData:', requestData);
      const response = await fetch('http://localhost:8000/api/service-request/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      console.log('DEBUG: Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('DEBUG: Success response data:', data);
        setPaymentId(data.payment_id);
        setRealAmount(Number(data.total_amount));
        setShowPaymentOptions(true);
      } else {
        const data = await response.json();
        console.log('DEBUG: Error response data:', data);
        setError(data.message || 'Failed to submit request');
      }
    } catch (err) {
      console.error('DEBUG: Exception in handleSubmit:', err);
      setError('An error occurred while submitting your request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayLater = async () => {
    setIsSubmitting(true);
    try {
      const requestData = {
        service_type: 'mechanical',
        user_email: userEmail,
        vehicle_type: formData.vehicleType,
        vehicle_number: formData.vehicleNumber,
        issue: formData.issue,
        notes: formData.notes,
        location_lat: location.lat,
        location_lng: location.lng,
        total_amount: total,
        payment_method: 'cod'
      };
      await fetch('http://localhost:8000/api/service-request/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
    } catch (err) {}
    setShowPaymentOptions(false);
    setShowConfirmation(true);
    setNotification({
      show: true,
      message: 'Request submitted to admin. Admin will assign a mechanic in your area. Please wait.',
      type: 'success'
    });
    setIsSubmitting(false);
  };

  const handleRazorpayOpen = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:8000/api/payment/create-order/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: realAmount })
      });
      const data = await res.json();
      setOrderId(data.order_id);
    } catch (err) {
      setNotification({ show: true, message: 'Failed to initiate payment.', type: 'error' });
    }
    setIsSubmitting(false);
  };

  const handleRazorpaySuccess = async (response) => {
    setIsSubmitting(true);
    try {
      await fetch('http://localhost:8000/api/payment/verify/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          payment_db_id: paymentId
        })
      });
    } catch (err) {}
    setShowPaymentOptions(false);
    setShowConfirmation(true);
    setNotification({
      show: true,
      message: 'Payment successful! Request submitted to admin. Admin will assign a mechanic in your area. Please wait.',
      type: 'success'
    });
    setIsSubmitting(false);
  };

  const handleRazorpayFailure = () => {
    setNotification({
      show: true,
      message: 'Payment was not completed.',
      type: 'error'
    });
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
  const basePrice = getIssuePrice();
  const total = basePrice + (prices.service_charge || 0);

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

  if (showPaymentOptions) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center border border-gray-100"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💳</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Choose Payment Option</h2>
            <p className="text-gray-600 text-lg">How would you like to pay for your service?</p>
            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-sm text-blue-800 font-medium">Total Amount</p>
              <p className="text-2xl font-bold text-blue-600">₹{realAmount?.toFixed(2) || '0.00'}</p>
            </div>
          </motion.div>

          {/* Payment Options */}
          <div className="space-y-4">
            {/* Pay Now Option */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              onClick={async () => { await handleRazorpayOpen(); }}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 focus:outline-none focus:ring-4 focus:ring-blue-300"
              disabled={isSubmitting}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-xl">⚡</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold">Pay Now</h3>
                    <p className="text-blue-100 text-sm">Instant payment via Razorpay</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-blue-100">Secure</div>
                  <div className="text-xs text-blue-200">Instant</div>
                </div>
              </div>
              {isSubmitting && (
                <div className="absolute inset-0 bg-blue-800/50 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </motion.button>

            {/* Razorpay Button (if order created) */}
            {orderId && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="mt-4"
              >
                <RazorpayButton
                  amount={realAmount}
                  orderId={orderId}
                  user={{ name: '', email: userEmail || '', phone: '' }}
                  onSuccess={handleRazorpaySuccess}
                  onFailure={handleRazorpayFailure}
                  buttonText="Proceed to Pay"
                />
              </motion.div>
            )}

            {/* Pay Later Option */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              onClick={handlePayLater}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-0 focus:outline-none focus:ring-4 focus:ring-gray-300"
              disabled={isSubmitting}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-xl">🕒</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold">Pay Later</h3>
                    <p className="text-gray-100 text-sm">Cash on Delivery</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-100">Flexible</div>
                  <div className="text-xs text-gray-200">COD</div>
                </div>
              </div>
              {isSubmitting && (
                <div className="absolute inset-0 bg-gray-800/50 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </motion.button>
          </div>

          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            onClick={() => setShowPaymentOptions(false)}
            className="mt-6 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
          >
            ← Back to form
          </motion.button>
        </motion.div>

        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.show}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Request Submitted</h2>
          <p className="mb-6 text-gray-600">Request submitted to admin. Admin will assign a mechanic in your area. Please wait.</p>
        </div>
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.show}
          onClose={() => setNotification({ ...notification, show: false })}
        />
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

          {/* Remove all available mechanics logic and UI */}

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
            {/* Price Breakdown */}
            <div className="mt-4 space-y-2">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Base Price:</span>
                  <span className="font-medium">₹{basePrice}</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-gray-600">Service Charge:</span>
                  <span className="font-medium">₹{prices.service_charge || 0}</span>
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-orange-700">₹{total}</span>
                  </div>
                </div>
              </div>
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

            {/* Delivery Time */}
            <div>
              <label htmlFor="deliveryTime" className="block text-sm font-medium text-gray-700">
                Preferred Delivery Time *
              </label>
              <input
                type="datetime-local"
                id="deliveryTime"
                name="deliveryTime"
                value={formData.deliveryTime}
                onChange={handleChange}
                required
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
