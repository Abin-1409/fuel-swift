'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import RazorpayButton from '../components/RazorpayButton';
import Notification from '../components/Notification';

const API_BASE_URL = 'http://localhost:8000';

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
    notes: '',
    deliveryTime: ''
  });
  const [error, setError] = useState('');
  const [prices, setPrices] = useState({});
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const [orderId, setOrderId] = useState(null); // For Razorpay order
  const [paymentId, setPaymentId] = useState(null); // Our Payment model ID
  const [realAmount, setRealAmount] = useState(null); // Amount from backend
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Fetch EV charger prices
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/services/electric/prices/`)
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!location) {
      setError('Please enable location services to continue');
      return;
    }

    if (!formData.vehicleType || !formData.vehicleNumber || !formData.chargerType || !formData.chargingRequirement || !formData.preferredTime) {
      setError('Please fill in all required fields');
      return;
    }
    if (!formData.deliveryTime) {
      setError('Please select a preferred delivery time');
      return;
    }

    try {
      const requestData = {
        service_type: 'ev',
        user_email: userEmail,
        vehicle_type: formData.vehicleType,
        vehicle_number: formData.vehicleNumber,
        charger_type: formData.chargerType,
        charging_requirement: formData.chargingRequirement,
        preferred_time: formData.preferredTime,
        notes: formData.notes,
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
        service_type: 'ev',
        user_email: userEmail,
        vehicle_type: formData.vehicleType,
        vehicle_number: formData.vehicleNumber,
        charger_type: formData.chargerType,
        charging_requirement: formData.chargingRequirement,
        preferred_time: formData.preferredTime,
        notes: formData.notes,
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency EV Charging Service</h1>
            <p className="text-gray-600">Mobile charging assistance for your electric vehicle</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Remove all available chargers logic and UI */}

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
