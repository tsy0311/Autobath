import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaShoppingCart, FaHeart, FaShare, FaStar, FaPlus, FaMinus, FaPalette, FaTruck, FaStore, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/products/${id}`);
      if (response.data.success) {
        setProduct(response.data.product);
        // Set default color if available
        if (response.data.product.colors && response.data.product.colors.length > 0) {
          setSelectedColor(response.data.product.colors[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product details');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = () => {
    if (!product) return;

    const cartItem = {
      id: product.id,
      name: product.name,
      price: getFinalPrice(),
      image: getCurrentImage(),
      color: selectedColor ? selectedColor.color_name : null,
      colorId: selectedColor ? selectedColor.id : null,
      quantity: quantity
    };

    addToCart(cartItem);
    toast.success(`${product.name} added to cart!`);
  };

  const getCurrentImage = () => {
    if (product.images && product.images.length > 0) {
      return product.images[selectedImage]?.image_url || product.image_url;
    }
    return product.image_url;
  };

  const getFinalPrice = () => {
    let basePrice = parseFloat(product.price);
    if (selectedColor && selectedColor.price_adjustment) {
      basePrice += parseFloat(selectedColor.price_adjustment);
    }
    return basePrice;
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 99) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="py-20">
        <div className="container">
          <div className="text-center">
            <div className="spinner-large mb-4"></div>
            <p className="text-gray-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20">
        <div className="container">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">Product not found</h2>
            <button className="btn" onClick={() => navigate('/products')}>
              Back to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 md:py-20">
      <div className="container px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
        >
          <FaArrowLeft />
          <span>Back to Products</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
              <img
                src={getCurrentImage()}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Image Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? 'border-secondary'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={image.alt_text || product.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-secondary/10 text-secondary text-sm font-semibold rounded-full">
                  {product.brand}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  {product.category}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <FaStar className="text-yellow-400" />
                  <FaStar className="text-yellow-400" />
                  <FaStar className="text-yellow-400" />
                  <FaStar className="text-yellow-400" />
                  <FaStar className="text-yellow-400" />
                  <span className="ml-2 text-sm text-gray-600">(4.8)</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <FaHeart />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                    <FaShare />
                  </button>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-primary">
                RM {getFinalPrice().toFixed(2)}
              </span>
              {selectedColor && selectedColor.price_adjustment !== 0 && (
                <span className="text-lg text-gray-500">
                  (Base: RM {parseFloat(product.price).toFixed(2)})
                </span>
              )}
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                  <FaPalette className="text-secondary" />
                  Color Options
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedColor?.id === color.id
                          ? 'border-secondary bg-secondary/10 text-secondary'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {color.color_code && (
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.color_code }}
                        ></div>
                      )}
                      <span className="font-medium">{color.color_name}</span>
                      {color.price_adjustment !== 0 && (
                        <span className="text-sm text-gray-500">
                          ({color.price_adjustment > 0 ? '+' : ''}RM {color.price_adjustment})
                        </span>
                      )}
                      {selectedColor?.id === color.id && (
                        <FaCheck className="text-secondary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold text-primary mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="w-8 h-8 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <FaMinus className="text-sm" />
                  </button>
                  <span className="w-12 text-center text-lg font-bold text-primary">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="w-8 h-8 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <FaPlus className="text-sm" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  {product.stock} in stock
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-secondary hover:bg-secondary-dark text-white py-4 px-6 rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
              >
                <FaShoppingCart />
                Add to Cart
              </button>
              <button className="px-6 py-4 border-2 border-secondary text-secondary hover:bg-secondary hover:text-white rounded-xl font-bold transition-colors">
                Buy Now
              </button>
            </div>

            {/* Delivery Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-primary mb-3">Delivery Options</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <FaTruck className="text-green-600" />
                  <span>Free delivery for orders over RM100</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FaStore className="text-blue-600" />
                  <span>Available for pickup at our shop</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {['description', 'specifications', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab
                      ? 'border-secondary text-secondary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {product.description || 'No description available for this product.'}
                </p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-primary mb-2">Product Details</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Brand:</dt>
                      <dd className="font-medium">{product.brand}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Category:</dt>
                      <dd className="font-medium">{product.category}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Stock:</dt>
                      <dd className="font-medium">{product.stock} units</dd>
                    </div>
                    {selectedColor && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Selected Color:</dt>
                        <dd className="font-medium">{selectedColor.color_name}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                <div>
                  <h4 className="font-semibold text-primary mb-2">Pricing</h4>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Base Price:</dt>
                      <dd className="font-medium">RM {parseFloat(product.price).toFixed(2)}</dd>
                    </div>
                    {selectedColor && selectedColor.price_adjustment !== 0 && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Color Adjustment:</dt>
                        <dd className="font-medium">
                          {selectedColor.price_adjustment > 0 ? '+' : ''}RM {selectedColor.price_adjustment}
                        </dd>
                      </div>
                    )}
                    <div className="flex justify-between border-t pt-2">
                      <dt className="text-gray-600 font-semibold">Total Price:</dt>
                      <dd className="font-bold text-lg">RM {getFinalPrice().toFixed(2)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-12">
                <FaStar className="text-4xl text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No reviews yet</h3>
                <p className="text-gray-500">Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
