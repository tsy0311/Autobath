import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaPumpSoap, FaTags, FaEye } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import api from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [brands, setBrands] = useState(['All']);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const ProductIcon = FaPumpSoap;

  useEffect(() => {
    fetchProducts();
    fetchBrands();
  }, []);

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

  const handleAddToCart = (product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
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
        <div className="max-w-md mx-auto mb-8">
          <input
            type="text"
            className="form-control text-center"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isSearching && (
          <div className="text-center text-gray-600 mb-6">{filteredProducts.length} results found</div>
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
                onClick={() => setSelectedBrand(brand)}
              >
                {displayText}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => {
            return (
              <div key={product.id} className="card group hover:shadow-xl transition-all duration-300">
                <div 
                  className="flex items-center justify-center h-32 bg-gradient-to-br from-secondary/10 to-secondary/20 cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0].image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ProductIcon className="text-6xl text-secondary" />
                  )}
                </div>
                <div className="p-6">
                  <h3 
                    className="text-xl font-bold text-primary mb-3 cursor-pointer hover:text-secondary transition-colors"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.name}
                  </h3>
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
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <FaShoppingCart /> 
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button 
                      className="px-4 py-2 border border-secondary text-secondary hover:bg-secondary hover:text-white rounded-lg transition-colors flex items-center justify-center"
                      onClick={() => navigate(`/product/${product.id}`)}
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
    </div>
  );
};

export default Products;
