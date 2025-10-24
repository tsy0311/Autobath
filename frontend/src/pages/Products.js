import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaShoppingCart, FaPumpSoap, FaTags, FaEye, FaTimes } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import VariantSelectionModal from '../components/VariantSelectionModal';
import { getImageUrl } from '../utils/imageUtils';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brands, setBrands] = useState(['All']);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL parameters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedBrand, setSelectedBrand] = useState(searchParams.get('brand') || 'All');

  const ProductIcon = FaPumpSoap;

  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, []);

  // Sync state with URL parameters on page load/back navigation
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const brand = searchParams.get('brand') || 'All';
    setSearchQuery(search);
    setSelectedBrand(brand);
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/products');
      setProducts(response.data.products);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await api.get('/api/products/brands/list');
      setBrands(['All', ...(response.data.brands || [])]);
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  };

  // Update URL when search parameters change
  const updateSearchParams = (search, brand) => {
    const params = new URLSearchParams();
    if (search && search.trim()) {
      params.set('search', search.trim());
    }
    if (brand && brand !== 'All') {
      params.set('brand', brand);
    }
    setSearchParams(params);
  };

  // Handle search query change
  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  // Debounce URL update for search query
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateSearchParams(searchQuery, selectedBrand);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedBrand]);

  // Handle brand filter change
  const handleBrandChange = (brand) => {
    setSelectedBrand(brand);
    updateSearchParams(searchQuery, brand);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBrand('All');
    setSearchParams({});
  };

  const handleAddToCart = (product, selectedVariant = null) => {
    addToCart(product, selectedVariant);
    const variantText = selectedVariant ? ` (${selectedVariant.color_name})` : '';
    toast.success(`${product.name}${variantText} added to cart!`);
  };

  const handleAddToCartClick = (product) => {
    // Check if product has variants
    if (product.colors && product.colors.length > 0) {
      setSelectedProduct(product);
      setShowVariantModal(true);
    } else {
      handleAddToCart(product);
    }
  };

  const filteredProducts = products
    .filter(product => selectedBrand === 'All' || product.brand === selectedBrand)
    .filter(p =>
    p.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  if (loading) {
    return (
      <div className="py-20">
        <div className="container">
          <div className="section-title">
            <h2>Our Products</h2>
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20">
        <div className="container">
          <div className="section-title">
            <h2>Our Products</h2>
            <p className="text-red-500">Error loading products</p>
          </div>
        </div>
      </div>
    );
  }

  const isSearching = searchQuery.trim().length > 0;
  return (
    <div className="py-12 sm:py-16 md:py-20">
      <div className="container px-4">
        <div className="section-title">
          <h2>Our Products</h2>
          <p>Premium car detailing products for professional results</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8 relative">
          <input
            type="text"
            className="form-control text-center pr-10"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={clearFilters}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>

        {(isSearching || selectedBrand !== 'All') && (
          <div className="text-center text-gray-600 mb-6">
              {filteredProducts.length} products found
          </div>
        )}

        {/* Brand Filter */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          {brands.map(brand => {
            const displayText = brand === 'All' ? 'All' : brand;
            const isSelected = selectedBrand === brand || (brand === 'All' && selectedBrand === 'All');
            return (
              <button
                key={brand}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ${
                  isSelected
                    ? 'bg-secondary text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-700 hover:bg-secondary hover:text-white'
                }`}
                onClick={() => handleBrandChange(brand)}
              >
                {displayText}
              </button>
            );
          })}
          {(searchQuery || selectedBrand !== 'All') && (
            <button
              onClick={clearFilters}
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-300 flex items-center gap-2"
              title="Clear all filters"
            >
              <FaTimes /> Clear
            </button>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => {
            return (
              <div 
                key={product.id} 
                className="card group hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="aspect-square flex items-center justify-center bg-gradient-to-br from-secondary/10 to-secondary/20 overflow-hidden relative">
                  {(() => {
                    // Get image URL from either images array or main image_url field
                    let imageUrl = null;
                    if (product.images && product.images.length > 0) {
                      // Prefer .jpg files over .heic files for better browser compatibility
                      const jpgImage = product.images.find(img => img.image_url && img.image_url.toLowerCase().endsWith('.jpg'));
                      imageUrl = jpgImage ? getImageUrl(jpgImage.image_url) : getImageUrl(product.images[0].image_url);
                    } else if (product.image_url && product.image_url.trim() !== '') {
                      imageUrl = getImageUrl(product.image_url);
                    }
                    
                    
                    if (imageUrl) {
                      return (
                        <>
                          <img 
                            src={imageUrl} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // If it's a .heic file that failed, try to find a .jpg alternative
                              if (imageUrl && imageUrl.toLowerCase().endsWith('.heic') && product.images && product.images.length > 1) {
                                const jpgImage = product.images.find(img => img.image_url && img.image_url.toLowerCase().endsWith('.jpg'));
                                if (jpgImage) {
                                  e.target.src = getImageUrl(jpgImage.image_url);
                                  return;
                                }
                              }
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                            onLoad={(e) => {
                              e.target.nextSibling.style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center" style={{ display: 'none' }}>
                            <ProductIcon className="text-6xl text-secondary" />
                          </div>
                        </>
                      );
                    }
                    return (
                      <ProductIcon className="text-6xl text-secondary" />
                    );
                  })()}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-xl font-bold text-primary hover:text-secondary transition-colors">
                      {product.name}
                    </h3>
                    {product.colors && product.colors.length > 0 && (
                      <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                        <FaTags className="text-xs" />
                        {product.colors.length} variant{product.colors.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-3 text-sm text-gray-500">
                    <span className="inline-flex items-center gap-1 bg-secondary/10 text-secondary px-3 py-1 rounded-full">
                      <FaTags /> {product.brand || 'Unbranded'}
                    </span>
                    <span>Stock: {product.stock}</span>
                  </div>
                  <div className="text-sm text-gray-500 mb-4">Sold: {product.sold ?? 0}</div>
                  <div className="text-2xl font-bold text-primary mb-4">RM {product.price.toFixed(2)}</div>
                  <div className="flex gap-2">
                    <button 
                      className="btn flex-1 flex items-center justify-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCartClick(product);
                      }}
                      disabled={product.stock === 0}
                    >
                      <FaShoppingCart /> 
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button 
                      className="px-4 py-2 border border-secondary text-secondary hover:bg-secondary hover:text-white rounded-lg transition-colors flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${product.id}`);
                      }}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found</p>
          </div>
        )}
      </div>

      {/* Variant Selection Modal */}
      <VariantSelectionModal
        isOpen={showVariantModal}
        onClose={() => {
          setShowVariantModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
};

export default Products;
