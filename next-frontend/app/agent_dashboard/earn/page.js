'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function EarningsPage() {
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: 'agent123@upi',
    bankAccount: {
      accountNumber: 'XXXX1234',
      ifsc: 'SBIN0001234',
      bankName: 'State Bank of India'
    }
  });

  // Mock data - replace with actual API calls
  const earningsData = {
    week: {
      total: 12450,
      breakdown: {
        serviceCharge: 11200,
        tips: 1250
      },
      status: 'pending',
      tasks: 28,
      averagePerTask: 445
    },
    month: {
      total: 48500,
      breakdown: {
        serviceCharge: 43650,
        tips: 4850
      },
      status: 'paid',
      tasks: 112,
      averagePerTask: 433
    }
  };

  const handleDownloadReport = (type) => {
    // Implement report download logic
    console.log(`Downloading ${type} report...`);
  };

  const handleUpdatePaymentDetails = (type) => {
    // Implement payment details update logic
    console.log(`Updating ${type} details...`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Earnings & Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Track your earnings, payments, and manage payment details</p>
        </div>

        {/* Period Selector */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedPeriod('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                selectedPeriod === 'week'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setSelectedPeriod('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                selectedPeriod === 'month'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              This Month
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Earnings Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Earnings Summary</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedPeriod === 'week' ? 'Last 7 days' : 'Last 30 days'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  earningsData[selectedPeriod].status === 'paid'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {earningsData[selectedPeriod].status === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">₹{earningsData[selectedPeriod].total}</p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    {selectedPeriod === 'week' ? 'This week' : 'This month'}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{earningsData[selectedPeriod].tasks}</p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Avg. ₹{earningsData[selectedPeriod].averagePerTask} per task
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Service Charges</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">₹{earningsData[selectedPeriod].breakdown.serviceCharge}</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tips Received</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">₹{earningsData[selectedPeriod].breakdown.tips}</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <button
                  onClick={() => handleDownloadReport('invoice')}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Invoice
                </button>
                <button
                  onClick={() => handleDownloadReport('payout')}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Payout Report
                </button>
              </div>
            </div>
          </motion.div>

          {/* Payment Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Details</h2>

              {/* UPI Details */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-600">UPI ID</p>
                  <button
                    onClick={() => handleUpdatePaymentDetails('upi')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Update
                  </button>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{paymentDetails.upiId}</p>
                </div>
              </div>

              {/* Bank Account Details */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-600">Bank Account</p>
                  <button
                    onClick={() => handleUpdatePaymentDetails('bank')}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Update
                  </button>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    {paymentDetails.bankAccount.bankName}
                  </p>
                  <p className="text-sm text-gray-600">
                    A/C: {paymentDetails.bankAccount.accountNumber}
                  </p>
                  <p className="text-sm text-gray-600">
                    IFSC: {paymentDetails.bankAccount.ifsc}
                  </p>
                </div>
              </div>

              {/* Payment Schedule */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Payment Schedule</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Weekly Payout</p>
                      <p className="text-xs text-gray-500">Every Sunday</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Monthly Bonus</p>
                      <p className="text-xs text-gray-500">1st of every month</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
