'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import RazorpayButton from '../components/RazorpayButton';
import Notification from '../components/Notification';

const API_BASE_URL = 'http://localhost:8000';

export default function AirService() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [formData, setFormData] = useState({
    vehicleType: '',
    vehicleNumber: '',
    tyreCount: '',
    tyreType: '',
    notes: '',
    deliveryTime: ''
  });
  const [leakDetectionEnabled, setLeakDetectionEnabled] = useState(false);
  const [error, setError] = useState('');
  const [prices, setPrices] = useState({ price_per_tyre: 10, leak_detection_price: 20, service_charge: 0 });
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const [orderId, setOrderId] = useState(null); // For Razorpay order
  const [paymentId, setPaymentId] = useState(null); // Our Payment model ID
  const [realAmount, setRealAmount] = useState(null); // Amount from backend
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Fetch air service prices
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/services/air/prices/`)
      .then(res => res.json())
      .then(data => {
        if (data.price_per_tyre && data.leak_detection_price) {
          setPrices(data);
        }
      });
  }, []);

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
              setLoading(false);
            },
            (error) => {
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserEmail((localStorage.getItem('userEmail') || '').trim().toLowerCase());
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate total price
  const tyreCount = parseInt(formData.tyreCount) || 0;
  const basePrice = (prices.price_per_tyre * tyreCount) + (leakDetectionEnabled ? prices.leak_detection_price : 0);
  const total = basePrice + prices.service_charge;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!location) {
      setError('Please enable location services to continue');
      return;
    }
    if (!formData.vehicleType || !formData.vehicleNumber || !formData.tyreCount || !formData.tyreType) {
      setError('Please fill in all required fields');
      return;
    }
    if (!formData.deliveryTime) {
      setError('Please select a preferred delivery time');
      return;
    }

    try {
      const requestData = {
        service_type: 'air',
        user_email: userEmail,
        vehicle_type: formData.vehicleType,
        vehicle_number: formData.vehicleNumber,
        tyre_count: formData.tyreCount,
        tyre_type: formData.tyreType,
        notes: formData.notes,
        leak_detection: leakDetectionEnabled ? 'yes' : 'no',
        location_lat: location.lat,
        location_lng: location.lng,
        total_amount: total,
        delivery_time: formData.deliveryTime
      };
      const response = await fetch(`${API_BASE_URL}/api/service-request/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
      if (response.ok) {
        const data = await response.json();
        setPaymentId(data.payment_id);
        setRealAmount(Number(data.total_amount));
        setShowPaymentOptions(true);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to submit request');
        setNotification({
          show: true,
          message: data.message || 'Failed to submit request',
          type: 'error'
        });
      }
    } catch (err) {
      setError('An error occurred while submitting your request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayLater = async () => {
    setIsSubmitting(true);
    try {
      const requestData = {
        service_type: 'air',
        user_email: userEmail,
        vehicle_type: formData.vehicleType,
        vehicle_number: formData.vehicleNumber,
        tyre_count: formData.tyreCount,
        tyre_type: formData.tyreType,
        notes: formData.notes,
        leak_detection: leakDetectionEnabled ? 'yes' : 'no',
        location_lat: location.lat,
        location_lng: location.lng,
        total_amount: total,
        payment_method: 'cod'
      };
      await fetch(`${API_BASE_URL}/api/service-request/create/`, {
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
      const res = await fetch(`${API_BASE_URL}/api/payment/create-order/`, {
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
      await fetch(`${API_BASE_URL}/api/payment/verify/`, {
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

  if (showPaymentOptions) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Choose Payment Option</h2>
          <p className="mb-6 text-gray-600">How would you like to pay for your service?</p>
          <button
            onClick={async () => { await handleRazorpayOpen(); }}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-4"
            disabled={isSubmitting}
          >
            Pay Now (Razorpay)
          </button>
          {orderId && (
            <RazorpayButton
              amount={realAmount}
              orderId={orderId}
              user={{ name: '', email: userEmail || '', phone: '' }}
              onSuccess={handleRazorpaySuccess}
              onFailure={handleRazorpayFailure}
              buttonText="Proceed to Pay"
            />
          )}
          <button
            onClick={handlePayLater}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            disabled={isSubmitting}
          >
            Pay Later (Cash on Delivery)
          </button>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tyre Air Service</h1>
            <p className="text-gray-600">Quick air refill and leak detection service</p>
          </div>
          {error && (
            <div className="mb-6 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {/* Remove all available technicians logic and UI */}
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
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
              />
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
            {/* Leak Detection Checkbox */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Leak Detection
              </label>
              <input
                type="checkbox"
                checked={leakDetectionEnabled}
                onChange={e => setLeakDetectionEnabled(e.target.checked)}
                className="mr-2"
              />
              <span>Enable Leak Detection (+₹{prices.leak_detection_price})</span>
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
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
              />
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
                  <span className="font-medium">₹{prices.service_charge}</span>
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total:</span>
                    <span className="text-lg font-bold text-blue-700">₹{total}</span>
                  </div>
                </div>
              </div>
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
