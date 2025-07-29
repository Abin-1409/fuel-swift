'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import BackButton from '../components/BackButton';
import RazorpayButton from '../components/RazorpayButton';
import Notification from '../components/Notification';

export default function DieselService() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [serviceData, setServiceData] = useState(null);
  const [formData, setFormData] = useState({
    vehicleType: '',
    vehicleNumber: '',
    quantityLiters: '',
    amountRupees: '',
    deliveryTime: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [lastModifiedField, setLastModifiedField] = useState(null); // Track which field was last modified
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderId, setOrderId] = useState(null); // For Razorpay order
  const [paymentId, setPaymentId] = useState(null); // Our Payment model ID
  const [realAmount, setRealAmount] = useState(null); // Amount from backend
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const API_BASE_URL = 'http://localhost:8000';

  // Get current location and service data
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
              
              // Fetch diesel service data
              try {
                const response = await fetch(`${API_BASE_URL}/api/services/type/diesel/`);
                if (response.ok) {
                  const data = await response.json();
                  setServiceData(data);
                }
              } catch (err) {
                console.error('Error fetching service data:', err);
                setError('Unable to fetch service information');
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserEmail((localStorage.getItem('userEmail') || '').trim().toLowerCase());
    }
  }, []);

  // Calculate total amount when quantity or amount changes
  useEffect(() => {
    if (serviceData && serviceData.price) {
      if (lastModifiedField === 'quantityLiters' && formData.quantityLiters) {
        const liters = parseFloat(formData.quantityLiters) || 0;
        const amount = liters * serviceData.price;
        setTotalAmount(amount);
        setFormData(prev => ({ ...prev, amountRupees: amount.toFixed(2) }));
      } else if (lastModifiedField === 'amountRupees' && formData.amountRupees) {
        const amount = parseFloat(formData.amountRupees) || 0;
        const liters = amount / serviceData.price;
        setTotalAmount(amount);
        setFormData(prev => ({ ...prev, quantityLiters: liters.toFixed(2) }));
      }
    }
  }, [formData.quantityLiters, formData.amountRupees, serviceData, lastModifiedField]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLastModifiedField(name); // Track which field is being modified
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
      setIsSubmitting(false);
      return;
    }

    if (!formData.vehicleType || !formData.vehicleNumber || (!formData.quantityLiters && !formData.amountRupees)) {
      setError('Please fill in all required fields');
      return;
    }
    if (!formData.deliveryTime) {
      setError('Please select a preferred delivery time');
      return;
    }

    try {
      const requestData = {
        service_type: 'diesel',
        user_email: userEmail,
        vehicle_type: formData.vehicleType,
        vehicle_number: formData.vehicleNumber,
        quantity_liters: formData.quantityLiters || null,
        amount_rupees: formData.amountRupees || null,
        delivery_time: formData.deliveryTime,
        location_lat: location.lat,
        location_lng: location.lng,
        notes: formData.notes
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
        service_type: 'diesel',
        user_email: userEmail,
        vehicle_type: formData.vehicleType,
        vehicle_number: formData.vehicleNumber,
        quantity_liters: formData.quantityLiters || null,
        amount_rupees: formData.amountRupees || null,
        delivery_time: formData.deliveryTime,
        location_lat: location.lat,
        location_lng: location.lng,
        notes: formData.notes,
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
        <LoadingSpinner 
          size="xlarge" 
          variant="location" 
          message="Getting your location and checking stock..."
          showMessage={true}
        />
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
        {/* Back Button */}
        <div className="mb-6">
          <BackButton href="/service" variant="ghost" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 card-enhanced"
        >
                      <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 heading-responsive">Diesel Delivery Request</h1>
              <p className="text-gray-600 text-responsive">Emergency diesel delivery to your location</p>
              {serviceData && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 p-3 bg-green-50 rounded-lg"
                >
                  <p className="text-sm text-green-800">
                    Current Price: ₹{serviceData.price} per liter
                    {serviceData.stock > 0 && ` | Available: ${serviceData.stock} liters`}
                  </p>
                </motion.div>
              )}
            </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Notification Component */}
            <Notification
              message={notification.message}
              type={notification.type}
              isVisible={notification.show}
              onClose={() => setNotification({ ...notification, show: false })}
            />
            {/* Location Display */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Current Location</p>
                  <p className="text-xs text-blue-700">
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
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Select vehicle type</option>
                <option value="truck">Truck</option>
                <option value="bus">Bus</option>
                <option value="car">Car</option>
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
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            {/* Quantity and Amount Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Quantity in Liters */}
              <div>
                <label htmlFor="quantityLiters" className="block text-sm font-medium text-gray-700">
                  Quantity (Liters) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="quantityLiters"
                    name="quantityLiters"
                    value={formData.quantityLiters}
                    onChange={handleChange}
                    step="0.01"
                    min="0.1"
                    max={serviceData?.stock || 100}
                    placeholder="Enter liters"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-12"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 text-sm">L</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {serviceData?.stock ? `Max: ${serviceData.stock} liters` : 'Enter quantity in liters'}
                </p>
                {lastModifiedField === 'quantityLiters' && formData.quantityLiters && (
                  <p className="mt-1 text-xs text-blue-600">
                    Auto-calculating amount...
                  </p>
                )}
              </div>

              {/* Amount in Rupees */}
              <div>
                <label htmlFor="amountRupees" className="block text-sm font-medium text-gray-700">
                  Amount (₹) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="amountRupees"
                    name="amountRupees"
                    value={formData.amountRupees}
                    onChange={handleChange}
                    step="0.01"
                    min="0.01"
                    placeholder="Enter amount"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-12"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-gray-500 text-sm">₹</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">Enter amount in rupees</p>
                {lastModifiedField === 'amountRupees' && formData.amountRupees && (
                  <p className="mt-1 text-xs text-blue-600">
                    Auto-calculating liters...
                  </p>
                )}
              </div>
            </div>

            {/* Calculation Info */}
            {serviceData && (formData.quantityLiters || formData.amountRupees) && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-xs text-green-800">
                  <strong>Calculation:</strong> ₹{serviceData.price} per liter
                  {formData.quantityLiters && formData.amountRupees && (
                    <span> • {formData.quantityLiters}L × ₹{serviceData.price} = ₹{totalAmount.toFixed(2)}</span>
                  )}
                </p>
              </div>
            )}

            {/* Total Amount Display */}
            {totalAmount > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-800">Total Amount:</span>
                  <span className="text-lg font-bold text-blue-900">₹{totalAmount.toFixed(2)}</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  {formData.quantityLiters && `${formData.quantityLiters} liters`}
                  {formData.amountRupees && !formData.quantityLiters && `${(parseFloat(formData.amountRupees) / serviceData?.price).toFixed(2)} liters`}
                </p>
              </div>
            )}

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
                placeholder="Any specific instructions or details about your vehicle/machinery"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="pt-4">
              <motion.button
                type="submit"
                disabled={!formData.quantityLiters && !formData.amountRupees || isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed btn-enhanced"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="small" variant="dots" showMessage={false} />
                    <span className="ml-2">Submitting...</span>
                  </div>
                ) : (
                  'Request Diesel Delivery'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
