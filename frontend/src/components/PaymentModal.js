import React, { useState } from 'react';
import { FaTimes, FaMobile, FaExclamationTriangle, FaShoppingCart } from 'react-icons/fa';
import TNGPaymentForm from './TNGPaymentForm';

const PaymentModal = ({ isOpen, onClose, orderData, onPaymentSuccess }) => {
  const [error, setError] = useState('');

  const handlePaymentSuccess = (paymentData) => {
    onPaymentSuccess(paymentData);
    onClose();
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary/10 rounded-full flex items-center justify-center">
              <FaMobile className="text-lg sm:text-2xl text-secondary" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-bold text-primary">Touch 'n Go</h2>
              <p className="text-xs text-gray-500 hidden sm:block">Secure Payment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-500 text-lg sm:text-xl" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="p-4 sm:p-6 bg-gradient-to-br from-secondary/5 to-secondary/10 border-b border-gray-200">
          <h3 className="text-sm sm:text-lg font-semibold text-primary mb-3 flex items-center gap-2">
            <FaShoppingCart className="text-secondary" />
            Order Summary
          </h3>
          <div className="space-y-2 text-sm sm:text-base text-gray-600">
            <div className="flex justify-between items-center">
              <span>Items ({orderData?.items?.length || 0})</span>
              <span className="font-medium">RM {orderData?.total?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center text-base sm:text-xl font-bold text-primary pt-2 border-t border-gray-300">
              <span>Total Amount</span>
              <span className="text-secondary">RM {orderData?.total?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 mx-4 mt-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-2">
            <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* TNG Payment Form */}
        <div className="p-4 sm:p-6">
          <TNGPaymentForm 
            orderData={orderData}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
