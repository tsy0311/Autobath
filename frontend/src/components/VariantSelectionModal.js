import React, { useState } from 'react';
import { FaTimes, FaCheck } from 'react-icons/fa';

const VariantSelectionModal = ({ isOpen, onClose, product, onAddToCart }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    onAddToCart(product, selectedVariant);
    onClose();
  };

  const getFinalPrice = () => {
    if (selectedVariant) {
      return product.price + (selectedVariant.price_adjustment || 0);
    }
    return product.price;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-primary">Select Variant</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <FaTimes className="text-gray-600" />
            </button>
          </div>

          {/* Product Info */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h4>
            <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
            <p className="text-sm text-gray-500">Base Price: RM {product.price.toFixed(2)}</p>
          </div>

          {/* Variant Selection */}
          <div className="mb-6">
            <h5 className="text-base font-semibold text-gray-900 mb-3">Available Variants</h5>
            
            {/* No Variant Option */}
            <div
              className={`p-3 border-2 rounded-lg cursor-pointer transition-all mb-3 ${
                selectedVariant === null
                  ? 'border-secondary bg-secondary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedVariant(null)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Standard</p>
                  <p className="text-sm text-gray-600">RM {product.price.toFixed(2)}</p>
                </div>
                {selectedVariant === null && (
                  <div className="w-6 h-6 bg-secondary text-white rounded-full flex items-center justify-center">
                    <FaCheck className="text-xs" />
                  </div>
                )}
              </div>
            </div>

            {/* Product Variants */}
            {product.colors && product.colors.length > 0 ? (
              product.colors.map((variant) => (
                <div
                  key={variant.id}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all mb-3 ${
                    selectedVariant?.id === variant.id
                      ? 'border-secondary bg-secondary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedVariant(variant)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {variant.color_image_url && (
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: variant.color_code || '#ccc' }}
                        />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{variant.color_name}</p>
                        <p className="text-sm text-gray-600">
                          RM {(product.price + (variant.price_adjustment || 0)).toFixed(2)}
                          {variant.price_adjustment !== 0 && (
                            <span className="text-xs text-gray-500 ml-1">
                              ({variant.price_adjustment > 0 ? '+' : ''}RM {variant.price_adjustment.toFixed(2)})
                            </span>
                          )}
                        </p>
                        {variant.stock !== undefined && (
                          <p className="text-xs text-gray-500">
                            Stock: {variant.stock > 0 ? `${variant.stock} available` : 'Out of stock'}
                          </p>
                        )}
                      </div>
                    </div>
                    {selectedVariant?.id === variant.id && (
                      <div className="w-6 h-6 bg-secondary text-white rounded-full flex items-center justify-center">
                        <FaCheck className="text-xs" />
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">No variants available</p>
            )}
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total Price:</span>
              <span className="text-xl font-bold text-secondary">RM {getFinalPrice().toFixed(2)}</span>
            </div>
            {selectedVariant && selectedVariant.price_adjustment !== 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Base: RM {product.price.toFixed(2)} + Adjustment: {selectedVariant.price_adjustment > 0 ? '+' : ''}RM {selectedVariant.price_adjustment.toFixed(2)}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddToCart}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-secondary to-secondary-dark text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariantSelectionModal;
