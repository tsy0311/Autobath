import React, { useState, useEffect, useCallback } from 'react';
import { FaMobile, FaQrcode, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaCopy } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const TNGPaymentForm = ({ orderData, onSuccess, onError, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');

  const startPaymentPolling = useCallback((paymentId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await api.post('/api/payments/tng/verify', {
          paymentId: paymentId
        });

        if (response.data.success) {
          if (response.data.status === 'completed') {
            setPaymentStatus('completed');
            clearInterval(pollInterval);
            // If backend returns amount (Billplz), verify it matches the order total
            const verifiedAmount = typeof response.data.amount === 'number' ? response.data.amount : null;
            if (verifiedAmount != null) {
              const expected = Number(orderData.total).toFixed(2);
              const actual = Number(verifiedAmount).toFixed(2);
              if (expected !== actual) {
                setError(`Amount mismatch. Expected RM ${expected}, got RM ${actual}.`);
                setPaymentStatus('timeout');
                onError('Amount mismatch');
                return;
              }
            }

            const successPayment = {
              paymentId: paymentId,
              method: 'tng',
              amount: orderData.total,
              currency: 'MYR',
              status: 'completed',
              transactionId: paymentId,
              qrCode: qrCode
            };

            onSuccess(successPayment);
            toast.success('TNG payment completed successfully!');
          }
        }
      } catch (error) {
        console.error('Payment verification error:', error);
      }
    }, 3000); // Poll every 3 seconds

    // Stop polling after 15 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (paymentStatus === 'pending') {
        setError('Payment timeout. Please try again.');
        setPaymentStatus('timeout');
      }
    }, 15 * 60 * 1000);
  }, [orderData.total, qrCode, onSuccess, paymentStatus]);

  const createTNGPayment = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Create TNG payment with exact amount from backend (Billplz or test mode)
      const response = await api.post('/api/payments/tng/create', {
        amount: orderData.total,
        orderId: orderData.id,
        customerInfo: orderData.customerInfo
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create TNG payment');
      }

      const p = response.data.payment;
      setPaymentData(p);
      setQrCode(p.qrCode || '');
      if (p.paymentId) {
        startPaymentPolling(p.paymentId);
      }
    } catch (error) {
      console.error('TNG payment creation error:', error);
      setError(error.message);
      onError(error.message);
    } finally {
      setLoading(false);
    }
  }, [orderData.total, orderData.id, orderData.customerInfo, onError, startPaymentPolling]);

  useEffect(() => {
    createTNGPayment();
  }, [createTNGPayment]);


  const copyPaymentId = () => {
    if (paymentData?.paymentId) {
      navigator.clipboard.writeText(paymentData.paymentId);
      toast.success('Payment ID copied to clipboard');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'timeout':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-600" />;
      case 'timeout':
        return <FaExclamationTriangle className="text-red-600" />;
      default:
        return <FaSpinner className="animate-spin text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 sm:py-12">
        <FaSpinner className="animate-spin text-3xl sm:text-4xl text-secondary mx-auto mb-3 sm:mb-4" />
        <p className="text-sm sm:text-base text-gray-600">Generating TNG payment...</p>
        <p className="text-xs text-gray-500 mt-2">Please wait</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 sm:py-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <FaExclamationTriangle className="text-2xl sm:text-4xl text-red-500" />
        </div>
        <p className="text-sm sm:text-base text-red-600 mb-4 px-4">{error}</p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center px-4">
          <button
            onClick={createTNGPayment}
            className="w-full sm:w-auto px-6 py-2.5 bg-secondary hover:bg-secondary-dark text-white rounded-lg font-semibold transition-colors text-sm sm:text-base"
          >
            Try Again
          </button>
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Payment Status */}
      <div className={`border-2 rounded-xl p-3 sm:p-4 ${getStatusColor(paymentStatus)}`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-xl sm:text-2xl">
            {getStatusIcon(paymentStatus)}
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm sm:text-base">
              {paymentStatus === 'completed' && '✅ Payment Completed'}
              {paymentStatus === 'timeout' && '⏱️ Payment Timeout'}
              {paymentStatus === 'pending' && '⏳ Waiting for Payment'}
            </p>
            <p className="text-xs sm:text-sm mt-0.5">
              {paymentStatus === 'completed' && 'Thank you! Your payment is confirmed.'}
              {paymentStatus === 'timeout' && 'Session expired. Please try again.'}
              {paymentStatus === 'pending' && 'Scan QR code with your TNG app'}
            </p>
          </div>
        </div>
      </div>

      {/* QR Code - Mobile Optimized */}
      {paymentStatus === 'pending' && (
        <div className="text-center bg-white rounded-xl border-2 border-secondary/20 p-4 sm:p-6">
          <div className="w-full max-w-[280px] sm:max-w-xs mx-auto bg-white rounded-2xl flex items-center justify-center mb-4 p-4 shadow-lg">
            {qrCode ? (
              <div className="relative">
                <img 
                  src={qrCode} 
                  alt="Payment QR Code" 
                  className="w-full h-auto rounded-lg"
                />
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                  Scan to Pay
                </div>
              </div>
            ) : (
              <div className="text-center p-4">
                <FaQrcode className="text-6xl sm:text-7xl text-secondary mx-auto mb-3 animate-pulse" />
                <p className="text-sm sm:text-base font-bold text-gray-700">Scan to Pay</p>
                <p className="text-xs text-gray-500 mt-1">Touch 'n Go eWallet</p>
              </div>
            )}
          </div>
          <div className="bg-secondary/5 rounded-lg p-3 mb-3">
            <p className="text-xl sm:text-2xl font-bold text-secondary mb-1">
              RM {paymentData?.amount?.toFixed(2)}
            </p>
            <p className="text-xs text-gray-600">Amount to Pay</p>
          </div>
          {paymentData?.billplzUrl && (
            <a 
              href={paymentData.billplzUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block px-6 py-2.5 bg-secondary hover:bg-secondary-dark text-white rounded-lg font-semibold transition-colors text-sm sm:text-base mt-2"
            >
              Open Payment Page
            </a>
          )}
        </div>
      )}

      {/* Payment Details - Compact */}
      <div className="bg-gray-50 rounded-xl p-3 sm:p-4 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <span className="text-xs sm:text-sm text-gray-600">Payment ID:</span>
          <div className="flex items-center gap-1 flex-1 justify-end">
            <span className="font-mono text-[10px] sm:text-xs text-gray-800 truncate max-w-[150px] sm:max-w-none">
              {paymentData?.paymentId}
            </span>
            <button
              onClick={copyPaymentId}
              className="p-1.5 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
              title="Copy Payment ID"
            >
              <FaCopy className="text-xs text-gray-500" />
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-gray-600">Expires:</span>
          <span className="text-xs sm:text-sm text-red-600 font-medium">
            {paymentData?.expiresAt ? new Date(paymentData.expiresAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '15 mins'}
          </span>
        </div>
      </div>

      {/* Instructions - Mobile Optimized */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200 rounded-xl p-3 sm:p-4">
        <h4 className="font-bold text-blue-900 mb-2 sm:mb-3 text-sm sm:text-base flex items-center gap-2">
          <FaMobile className="text-blue-600" />
          How to Pay:
        </h4>
        <ol className="text-xs sm:text-sm text-blue-800 space-y-1.5 sm:space-y-2">
          <li className="flex items-start gap-2">
            <span className="font-bold min-w-[20px]">1.</span>
            <span>Open TNG eWallet app on your phone</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold min-w-[20px]">2.</span>
            <span>Tap "Scan QR" or "Pay" button</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold min-w-[20px]">3.</span>
            <span>Scan the QR code above</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold min-w-[20px]">4.</span>
            <span>Verify amount (RM {paymentData?.amount?.toFixed(2)})</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-bold min-w-[20px]">5.</span>
            <span className="font-semibold">Complete payment in TNG app</span>
          </li>
        </ol>
      </div>

      {/* Auto-verify notice */}
      {paymentStatus === 'pending' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-xs sm:text-sm text-green-800">
            🔄 <span className="font-semibold">Auto-verifying...</span> Payment will be confirmed automatically after you complete it in your TNG app.
          </p>
        </div>
      )}

      {/* Action Buttons - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
        {paymentStatus === 'timeout' && (
          <button
            onClick={createTNGPayment}
            className="w-full sm:flex-1 px-4 sm:px-6 py-3 sm:py-3 bg-secondary hover:bg-secondary-dark text-white rounded-lg font-semibold transition-colors text-sm sm:text-base"
          >
            Try Again
          </button>
        )}
        <button
          onClick={onCancel}
          className="w-full sm:flex-1 px-4 sm:px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
        >
          {paymentStatus === 'completed' ? 'Close' : 'Cancel'}
        </button>
      </div>

      {/* Support Info */}
      <div className="text-[10px] sm:text-xs text-gray-500 text-center space-y-1 pt-2 border-t border-gray-200">
        <p>💡 Need help? Contact us via WhatsApp</p>
        <p>Payment issues? Email: autobath36@gmail.com</p>
      </div>
    </div>
  );
};

export default TNGPaymentForm;
