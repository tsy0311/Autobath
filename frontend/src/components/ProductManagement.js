import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaImage, FaTimes, FaBox, FaWarehouse, FaTags, FaDollarSign, FaPalette, FaUpload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import BulkImportModal from './BulkImportModal';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    brand: '',
    stock: '',
    image_url: ''
  });
  const [typeSelectionTitle, setTypeSelectionTitle] = useState('');
  const [typeSelectionOptions, setTypeSelectionOptions] = useState([]);
  const [newTypeOption, setNewTypeOption] = useState({ name: '', price_adjustment: 0, stock: 0 });
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [enableTypeSelection, setEnableTypeSelection] = useState(false);
  const [productImages, setProductImages] = useState([]);
  const [productColors, setProductColors] = useState([]);
  const [newImage, setNewImage] = useState({ image_url: '', alt_text: '', sort_order: 0, is_primary: false });
  const [imagePreview, setImagePreview] = useState(null);
  const [newColor, setNewColor] = useState({ color_name: '', color_code: '', color_image_url: '', price_adjustment: 0, stock: 0, is_available: true, sort_order: 0 });
  const [activeTab, setActiveTab] = useState('basic');
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchBrands();
    fetchCategories();
  }, []);

  const fetchBrands = async () => {
    try {
      const res = await api.get('/api/products/brands/list');
      setBrands(res.data.brands || []);
    } catch (e) {
      console.error('Failed to load brands', e);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/products/categories');
      setCategories(res.data.categories || []);
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (product = null) => {
    if (product) {
      try {
        // Always fetch full, fresh product details including images/colors
        const res = await api.get(`/api/products/${product.id}`);
        if (res.data?.success && res.data.product) {
          const full = res.data.product;
          setEditingProduct(full);
          setFormData({
            name: full.name,
            description: full.description || '',
            price: full.price,
            brand: full.brand || '',
            stock: full.stock,
            image_url: full.image_url || ''
          });

          setProductImages(full.images || []);
          setProductColors(full.colors || []);
        } else {
          // Fallback to provided product object
          setEditingProduct(product);
          setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            brand: product.brand || '',
            stock: product.stock,
            image_url: product.image_url || ''
          });
          setProductImages(product.images || []);
          setProductColors(product.colors || []);
        }
      } catch (e) {
        console.error('Failed to fetch product details', e);
        // Fallback to provided product object
        setEditingProduct(product);
        setFormData({
          name: product.name,
          description: product.description || '',
          price: product.price,
          brand: product.brand || '',
          stock: product.stock,
          image_url: product.image_url || ''
        });
        setProductImages(product.images || []);
        setProductColors(product.colors || []);
      }
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        brand: brands[0] || '',
        stock: '',
        image_url: ''
      });
      setProductImages([]);
      setProductColors([]);
    }
    setEnableTypeSelection(false);
    setTypeSelectionTitle('');
    setTypeSelectionOptions([]);
    setNewTypeOption({ name: '', price_adjustment: 0, stock: 0 });
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      brand: '',
      stock: '',
      image_url: ''
    });
    setProductImages([]);
    setProductColors([]);
    setNewImage({ image_url: '', alt_text: '', sort_order: 0, is_primary: false });
    setImagePreview(null);
    setNewColor({ color_name: '', color_code: '', color_image_url: '', price_adjustment: 0, stock: 0, is_available: true, sort_order: 0 });
    setEnableTypeSelection(false);
    setTypeSelectionTitle('');
    setTypeSelectionOptions([]);
    setNewTypeOption({ name: '', price_adjustment: 0, stock: 0 });
    setActiveTab('basic');
  };

  const handleAddImage = async () => {
    if (!newImage.image_url.trim()) {
      toast.error('Please upload an image first');
      return;
    }

    if (editingProduct) {
      // For existing products, add directly to database
      try {
        const response = await api.post(`/api/products/${editingProduct.id}/images`, newImage);
        if (response.data.success) {
          toast.success('Image added successfully');
          // Reload the product to get updated images
          const productResponse = await api.get(`/api/products/${editingProduct.id}`);
          if (productResponse.data.success) {
            setProductImages(productResponse.data.product.images || []);
            // Also update the editing product to reflect changes
            setEditingProduct(productResponse.data.product);
          }
          // Refresh the products list to show updated product
          fetchProducts();
          setNewImage({ image_url: '', alt_text: '', sort_order: 0, is_primary: false });
        }
      } catch (error) {
        console.error('Error adding image:', error);
        toast.error('Failed to add image');
      }
    } else {
      // For new products, add to local state
      const newImageWithId = {
        ...newImage,
        id: Date.now(), // Temporary ID for local state
        product_id: null
      };
      setProductImages([...productImages, newImageWithId]);
      setNewImage({ image_url: '', alt_text: '', sort_order: 0, is_primary: false });
      toast.success('Image added to product (will be saved when product is created)');
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (editingProduct) {
      // For existing products, delete from database
      try {
        const response = await api.delete(`/api/products/images/${imageId}`);
        if (response.data.success) {
          toast.success('Image deleted successfully');
          // Reload the product to get updated images
          const productResponse = await api.get(`/api/products/${editingProduct.id}`);
          if (productResponse.data.success) {
            setProductImages(productResponse.data.product.images || []);
          }
        }
      } catch (error) {
        console.error('Error deleting image:', error);
        toast.error('Failed to delete image');
      }
    } else {
      // For new products, remove from local state
      setProductImages(productImages.filter(img => img.id !== imageId));
      toast.success('Image removed from product');
    }
  };



  const handleAddTypeOption = () => {
    if (!newTypeOption.name.trim()) {
      toast.error('Please enter a type option name');
      return;
    }

    const newOptionWithId = {
      ...newTypeOption,
      id: Date.now(),
      is_available: true,
      sort_order: typeSelectionOptions.length + 1
    };

    setTypeSelectionOptions([...typeSelectionOptions, newOptionWithId]);
    setNewTypeOption({ name: '', price_adjustment: 0, stock: 0 });
    toast.success('Type option added');
  };

  const handleDeleteTypeOption = (optionId) => {
    setTypeSelectionOptions(typeSelectionOptions.filter(option => option.id !== optionId));
    toast.success('Type option removed');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.brand || formData.price === '') {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let productId;
      if (editingProduct) {
        await api.put(`/api/products/${editingProduct.id}`, formData);
        productId = editingProduct.id;
        toast.success('Product updated successfully!');
      } else {
        const response = await api.post('/api/products', formData);
        productId = response.data.productId;
        toast.success('Product added successfully!');
      }

      // Add images if any were uploaded during creation
      if (productImages.length > 0 && productId && !editingProduct) {
        for (const image of productImages) {
          try {
            await api.post(`/api/products/${productId}/images`, image);
          } catch (error) {
            console.error('Error adding image:', error);
            toast.error(`Failed to add image: ${image.alt_text || 'Unknown'}`);
          }
        }
      }

      // Add colors if any were added during creation
      if (productColors.length > 0 && productId && !editingProduct) {
        for (const color of productColors) {
          try {
            await api.post(`/api/products/${productId}/colors`, color);
          } catch (error) {
            console.error('Error adding color:', error);
            toast.error(`Failed to add color: ${color.color_name}`);
          }
        }
      }

      // Add type selection options if enabled
      if (typeSelectionOptions.length > 0 && productId && !editingProduct) {
        for (const option of typeSelectionOptions) {
          try {
            const colorData = {
              color_name: option.name,
              color_code: null,
              color_image_url: null,
              price_adjustment: option.price_adjustment || 0,
              stock: option.stock,
              is_available: option.is_available,
              sort_order: option.sort_order
            };
            await api.post(`/api/products/${productId}/colors`, colorData);
          } catch (error) {
            console.error('Error adding type option:', error);
            toast.error(`Failed to add type option: ${option.name}`);
          }
        }
      }

      // Refresh the products list
      await fetchProducts();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving product:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to save product';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    try {
      await api.delete(`/api/products/${productId}`);
      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(product => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
                         product.name.toLowerCase().includes(searchLower) ||
                         product.description?.toLowerCase().includes(searchLower) ||
                         product.brand?.toLowerCase().includes(searchLower) ||
                         product.category?.toLowerCase().includes(searchLower);
    const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  // Debug logging
  console.log('Search term:', searchTerm);
  console.log('Selected brand:', selectedBrand);
  console.log('Total products:', products.length);
  console.log('Filtered products:', filteredProducts.length);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="spinner-large mb-4"></div>
        <p className="text-gray-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="product-management">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-primary mb-2">Product Management</h2>
          <p className="text-gray-600">Manage your product catalog - visible to customers</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleOpenModal()}
            className="btn bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <FaPlus /> Add New Product
          </button>
          <button
            onClick={() => setIsBulkImportOpen(true)}
            className="btn bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <FaUpload /> Bulk Import
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, description, brand, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {/* Brand Filter */}
          <div className="flex gap-2">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            >
              <option value="all">All Brands</option>
              {brands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            {(searchTerm || selectedBrand !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedBrand('all');
                }}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                title="Clear all filters"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Results Info */}
      {(searchTerm || selectedBrand !== 'all') && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            Showing {filteredProducts.length} of {products.length} products
            {searchTerm && ` matching "${searchTerm}"`}
            {selectedBrand !== 'all' && ` from ${selectedBrand}`}
          </p>
        </div>
      )}

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || selectedBrand !== 'all' 
              ? 'Try adjusting your filters'
              : 'Start by adding your first product'}
          </p>
          {!searchTerm && selectedBrand === 'all' && (
            <button
              onClick={() => handleOpenModal()}
              className="btn bg-gradient-to-r from-secondary to-secondary-dark text-white"
            >
              <FaPlus className="inline mr-2" /> Add Product
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              {/* Product Image */}
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="text-6xl text-gray-400"><i class="fas fa-image"></i></div>';
                    }}
                  />
                ) : product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="text-6xl text-gray-400"><i class="fas fa-image"></i></div>';
                    }}
                  />
                ) : (
                  <FaImage className="text-6xl text-gray-400" />
                )}
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-primary mb-1">{product.name}</h3>
                    {product.brand && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary text-xs font-semibold rounded-full">
                        <FaTags /> {product.brand}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {product.description || 'No description available'}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FaDollarSign className="text-green-600" />
                    <span className="text-2xl font-bold text-primary">RM {Number(product.price).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaWarehouse className="text-blue-600" />
                    <span className={`font-semibold ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                      {product.stock} in stock
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-secondary to-secondary-dark text-white p-6 rounded-t-2xl flex justify-between items-center">
              <h3 className="text-2xl font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-gray-200 text-2xl"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                {[
                  { id: 'basic', label: 'Basic Info', icon: FaBox },
                  { id: 'images', label: 'Images', icon: FaImage },
                  { id: 'variants', label: 'Variants', icon: FaPalette }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-b-2 border-secondary text-secondary'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'basic' && (
                <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="e.g., Car Wash Soap"
                    required
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Brand *
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="e.g., Meguiar's"
                    required
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (RM) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="0.00"
                    required
                  />
                </div>

                

                {/* Stock */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                  rows="3"
                  placeholder="Product description..."
                />
              </div>


              {/* Buttons - Only show for Basic Info tab */}
              {editingProduct && (
                <div className="flex gap-3 pt-4 mt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-secondary to-secondary-dark text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Update Product
                  </button>
                </div>
              )}
              {!editingProduct && (
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-secondary to-secondary-dark text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Add Product
                  </button>
                </div>
              )}
            </form>
              )}

              {/* Images Tab */}
              {activeTab === 'images' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-4">Product Images</h4>
                    
                    {/* Add New Image */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h5 className="font-medium text-gray-700 mb-3">Upload Image</h5>

                      {!imagePreview ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Select Image File</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              // Show preview immediately
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setImagePreview(reader.result);
                              };
                              reader.readAsDataURL(file);
                              
                              // Upload to server
                              const data = new FormData();
                              data.append('image', file);
                              try {
                                const res = await api.post('/api/upload', data, {
                                  headers: { 'Content-Type': 'multipart/form-data' }
                                });
                                console.log('Upload response:', res.data);
                                const imageUrl = res.data.url || res.data.path;
                                console.log('Image URL:', imageUrl);
                                setNewImage({...newImage, image_url: imageUrl});
                                toast.success('Image ready for confirmation');
                              } catch (err) {
                                console.error('Upload failed', err);
                                toast.error('Image upload failed');
                                setImagePreview(null);
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Image Preview */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Preview & Confirm (Square 1:1 Format)</label>
                            <div className="relative w-64 aspect-square mx-auto">
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="w-full h-full object-cover border-2 border-gray-300 rounded-lg"
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">Image will be displayed in 1:1 square format. Review before adding.</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                          <input
                            type="text"
                            value={newImage.alt_text}
                            onChange={(e) => setNewImage({...newImage, alt_text: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                            placeholder="Product image description"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                          <input
                            type="number"
                            value={newImage.sort_order}
                            onChange={(e) => setNewImage({...newImage, sort_order: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                            placeholder="0"
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={newImage.is_primary}
                              onChange={(e) => setNewImage({...newImage, is_primary: e.target.checked})}
                              className="rounded border-gray-300 text-secondary focus:ring-secondary"
                            />
                            <span className="text-sm text-gray-700">Primary Image</span>
                          </label>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setNewImage({ image_url: '', alt_text: '', sort_order: 0, is_primary: false });
                          }}
                          className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleAddImage();
                            setImagePreview(null);
                          }}
                          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors"
                        >
                          <FaPlus className="inline mr-2" />
                          Confirm & Add Image
                        </button>
                      </div>
                        </div>
                      )}
                    </div>

                    {/* Existing Images */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {productImages.map((image, index) => {
                        console.log('Rendering image:', image.image_url);
                        return (
                        <div key={image.id} className="relative group">
                          <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                            <img
                              src={image.image_url}
                              alt={image.alt_text || formData.name || 'Product image'}
                              className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Image failed to load:', image.image_url);
                              // Hide broken image without rendering any placeholder
                              e.currentTarget.style.display = 'none';
                            }}
                            />
                          </div>
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleDeleteImage(image.id)}
                              className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                          <div className="absolute bottom-2 left-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
                            {image.is_primary ? 'Primary' : `#${image.sort_order}`}
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons for Images Tab */}
                  <div className="flex gap-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        const formElement = document.querySelector('form');
                        if (formElement) {
                          formElement.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                        }
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-secondary to-secondary-dark text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                  </div>
                </div>
              )}

              {/* Variants Tab */}
              {activeTab === 'variants' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-2">Product Variants</h4>
                    <p className="text-sm text-gray-600 mb-4">Define product options like Size (Small/Large) or Color (Red/Green)</p>
                    
                    {/* Variant Type */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Variant Type (e.g., Size, Color, Model)
                      </label>
                      <input
                        type="text"
                        value={typeSelectionTitle}
                        onChange={(e) => setTypeSelectionTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                        placeholder="e.g., Size, Color, Model"
                      />
                    </div>

                    {/* Add New Variant */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h5 className="font-medium text-gray-700 mb-3">Add Variant Option</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Option Name *</label>
                          <input
                            type="text"
                            value={newTypeOption.name}
                            onChange={(e) => setNewTypeOption({...newTypeOption, name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                            placeholder="e.g., Small, Red, Standard"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                          <input
                            type="number"
                            value={newTypeOption.stock}
                            onChange={(e) => setNewTypeOption({...newTypeOption, stock: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddTypeOption}
                        className="mt-3 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors"
                      >
                        <FaPlus className="inline mr-2" />
                        Add Option
                      </button>
                    </div>

                    {/* Existing Variants */}
                    {typeSelectionOptions.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-3">Variant Options ({typeSelectionOptions.length})</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {typeSelectionOptions.map((option) => (
                            <div key={option.id} className="border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">{option.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTypeOption(option.id)}
                                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <FaTrash className="text-sm" />
                                </button>
                              </div>
                              <div className="text-sm text-gray-600">
                                <div>Stock: {option.stock}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons for Variants Tab */}
                  <div className="flex gap-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        const formElement = document.querySelector('form');
                        if (formElement) {
                          formElement.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                        }
                      }}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-secondary to-secondary-dark text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onImportComplete={() => {
          fetchProducts();
          toast.success('Products imported successfully!');
        }}
      />
    </div>
  );
};

export default ProductManagement;

