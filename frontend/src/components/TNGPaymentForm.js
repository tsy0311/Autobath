import React, { useState } from 'react';
import { FaMobile, FaQrcode, FaCheckCircle, FaUpload, FaTruck, FaStore, FaCopy, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import qrCodeImage from '../img/qrcode.jpeg';

const TNGPaymentForm = ({ orderData, onSuccess, onError, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: QR & Info, 2: Payment Proof
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState(null);
  const [deliveryOption, setDeliveryOption] = useState('collection');
  const [address, setAddress] = useState('');

  const orderId = orderData.id || `ORD-${Date.now()}`;
  const totalAmount = Number(orderData.total).toFixed(2);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setPaymentProofFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentProofPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPayment = async () => {
    // Prevent double submission
    if (loading) {
      return;
    }

    // Validate inputs
    if (!paymentProofFile) {
      toast.error('Please upload your payment receipt screenshot');
      return;
    }

    if (deliveryOption === 'delivery' && !address.trim()) {
      toast.error('Please enter your delivery address');
      return;
    }

    setLoading(true);

    try {
      let paymentProofUrl = null;

      // Upload payment proof if provided
      if (paymentProofFile) {
        const formData = new FormData();
        formData.append('image', paymentProofFile);

        const uploadRes = await api.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (uploadRes.data.success) {
          paymentProofUrl = uploadRes.data.url || uploadRes.data.path;
        }
      }

      // Create order with payment information
      const orderPayload = {
        customerInfo: orderData.customerInfo,
        items: orderData.items,
        total: orderData.total,
        payment: {
          method: 'tng',
          reference: paymentReference,
          proofUrl: paymentProofUrl
        },
        deliveryOption: deliveryOption,
        address: deliveryOption === 'delivery' ? address : null
      };

      const orderResponse = await api.post('/api/orders', orderPayload);

      if (orderResponse.data.success) {
        toast.success('Order submitted successfully! We will verify your payment and contact you soon.');
        
        // Pass success data back
        onSuccess({
          method: 'tng',
          reference: paymentReference,
          proofUrl: paymentProofUrl,
          orderId: orderResponse.data.order.id,
          deliveryOption: deliveryOption,
          address: deliveryOption === 'delivery' ? address : null
        });
      } else {
        throw new Error(orderResponse.data.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      toast.error(error.message || 'Failed to submit order. Please try again.');
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <FaMobile className="text-3xl text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Pay with Touch 'n Go</h3>
        <p className="text-gray-600">Scan QR code and complete payment</p>
      </div>

      {step === 1 && (
        <>
          {/* Order Summary */}
          <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-lg p-4 border border-secondary/20">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Order ID:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-primary">{orderId}</span>
                <button
                  onClick={() => copyToClipboard(orderId)}
                  className="p-1 hover:bg-white/50 rounded transition-colors"
                  title="Copy Order ID"
                >
                  <FaCopy className="text-secondary" />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Total Amount:</span>
              <span className="text-2xl font-bold text-secondary">RM {totalAmount}</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="bg-white border-2 border-secondary rounded-lg p-6">
            <div className="text-center mb-4">
              <FaQrcode className="text-4xl text-secondary mx-auto mb-2" />
              <h4 className="font-semibold text-lg">Scan QR Code to Pay</h4>
            </div>
            
            <div className="flex justify-center mb-4">
              <img 
                src={qrCodeImage} 
                alt="TNG QR Code" 
                className="w-64 h-64 object-contain border-4 border-gray-200 rounded-lg shadow-lg"
              />
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <FaInfoCircle className="text-blue-600 mt-1 flex-shrink-0" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-2">Payment Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Open your Touch 'n Go app</li>
                    <li>Scan the QR code above</li>
                    <li>Enter amount: <span className="font-bold">RM {totalAmount}</span></li>
                    <li>Include Order ID <span className="font-bold">{orderId}</span> in notes/description</li>
                    <li>Complete the payment</li>
                    <li>Take a screenshot of the payment receipt</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Option */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Delivery Option</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryOption('collection')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  deliveryOption === 'collection'
                    ? 'border-secondary bg-secondary/10 text-secondary'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                }`}
              >
                <FaStore className="text-3xl mb-2" />
                <span className="font-medium">Self Collection</span>
                <span className="text-xs mt-1">Pick up at store</span>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryOption('delivery')}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  deliveryOption === 'delivery'
                    ? 'border-secondary bg-secondary/10 text-secondary'
                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                }`}
              >
                <FaTruck className="text-3xl mb-2" />
                <span className="font-medium">Delivery</span>
                <span className="text-xs mt-1">We deliver to you</span>
              </button>
            </div>

            {deliveryOption === 'delivery' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address *</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                  rows="3"
                  placeholder="Enter your full delivery address..."
                  required
                />
              </div>
            )}
          </div>

          {/* Next Button */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setStep(2)}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-secondary to-secondary-dark text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              I've Paid - Next
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          {/* Payment Proof Upload */}
          <div className="bg-white border-2 border-secondary rounded-lg p-6">
            <h4 className="font-semibold text-lg mb-4 text-center">Upload Payment Receipt</h4>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 flex items-start gap-3">
              <FaInfoCircle className="text-blue-600 mt-1 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Please upload your payment receipt screenshot</p>
                <p>Make sure the screenshot clearly shows:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Payment amount (RM {totalAmount})</li>
                  <li>Transaction date & time</li>
                  <li>Reference/Transaction number</li>
                  <li>Recipient name</li>
                </ul>
              </div>
            </div>

            {/* Payment Proof Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Receipt Screenshot *
              </label>
              
              {!paymentProofPreview ? (
                <div className="border-2 border-dashed border-secondary rounded-lg p-8 text-center hover:border-secondary-dark transition-colors bg-secondary/5">
                  <FaUpload className="text-5xl text-secondary mx-auto mb-4" />
                  <p className="text-base font-medium text-gray-700 mb-2">Click to upload payment receipt</p>
                  <p className="text-sm text-gray-500 mb-4">or drag and drop your screenshot here</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="payment-proof-upload"
                  />
                  <label
                    htmlFor="payment-proof-upload"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-secondary to-secondary-dark text-white rounded-lg cursor-pointer hover:shadow-lg transition-all font-semibold"
                  >
                    Choose Screenshot
                  </label>
                  <p className="text-xs text-gray-500 mt-3">Supported: JPG, PNG (Max 5MB)</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={paymentProofPreview}
                      alt="Payment Proof"
                      className="w-full max-h-96 object-contain border-2 border-green-300 rounded-lg bg-gray-50"
                    />
                    <button
                      onClick={() => {
                        setPaymentProofFile(null);
                        setPaymentProofPreview(null);
                      }}
                      className="absolute top-3 right-3 px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 shadow-lg font-medium"
                    >
                      ✕ Remove
                    </button>
                  </div>
                  <div className="bg-green-50 border border-green-300 rounded-lg p-3 flex items-center gap-2">
                    <FaCheckCircle className="text-green-600 text-xl" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">Receipt uploaded successfully!</p>
                      <p className="text-xs text-green-600">We'll verify your payment within 24 hours</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Optional Reference Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Reference Number (Optional)
              </label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
                placeholder="Enter if you have it readily available"
              />
              <p className="text-xs text-gray-500 mt-1">
                We can see this in your screenshot, but you can enter it if you want to help us verify faster
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <button
              onClick={handleSubmitPayment}
              disabled={loading || !paymentProofFile}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  <span>Submit Order</span>
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TNGPaymentForm;
