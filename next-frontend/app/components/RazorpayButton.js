'use client';
import { useEffect } from 'react';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function RazorpayButton({ amount, orderId, user, onSuccess, onFailure, buttonText = 'Pay Now', className = '' }) {
  useEffect(() => {
    loadRazorpayScript();
  }, []);

  const handlePayment = async () => {
    const res = await loadRazorpayScript();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }
    const options = {
      key: 'rzp_test_qHVVGRqP506WMd', // Use env in production
      amount: Math.round(amount * 100), // in paise
      currency: 'INR',
      name: 'AutoNest',
      description: 'Service Payment',
      order_id: orderId, // Pass order_id if you have one from backend
      handler: function (response) {
        if (onSuccess) onSuccess(response);
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || ''
      },
      notes: {
        service: 'AutoNest Service Payment'
      },
      theme: {
        color: '#3B82F6'
      },
      modal: {
        ondismiss: function () {
          if (onFailure) onFailure('dismissed');
        }
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <button
      type="button"
      onClick={handlePayment}
      className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${className}`}
    >
      {buttonText}
    </button>
  );
} 