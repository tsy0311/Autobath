import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaImage, FaTimes, FaBox, FaWarehouse, FaTags, FaDollarSign, FaPalette, FaUpload, FaSort } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

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
    category: '',
    stock: '',
    image_url: ''
  });
  const [enableTypeSelection, setEnableTypeSelection] = useState(false);
  const [typeSelectionTitle, setTypeSelectionTitle] = useState('');
  const [typeSelectionOptions, setTypeSelectionOptions] = useState([]);
  const [newTypeOption, setNewTypeOption] = useState({ name: '', price_adjustment: 0, stock: 0 });
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productImages, setProductImages] = useState([]);
  const [productColors, setProductColors] = useState([]);
  const [newImage, setNewImage] = useState({ image_url: '', alt_text: '', sort_order: 0, is_primary: false });
  const [newColor, setNewColor] = useState({ color_name: '', color_code: '', color_image_url: '', price_adjustment: 0, stock: 0, is_available: true, sort_order: 0 });
  const [activeTab, setActiveTab] = useState('basic');

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
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        brand: product.brand || '',
        category: product.category || '',
        stock: product.stock,
        image_url: product.image_url || ''
      });
      
      // Load product images and colors
      setProductImages(product.images || []);
      setProductColors(product.colors || []);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        brand: brands[0] || '',
        category: categories[0]?.name || '',
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
    setNewColor({ color_name: '', color_code: '', color_image_url: '', price_adjustment: 0, stock: 0, is_available: true, sort_order: 0 });
    setEnableTypeSelection(false);
    setTypeSelectionTitle('');
    setTypeSelectionOptions([]);
    setNewTypeOption({ name: '', price_adjustment: 0, stock: 0 });
    setActiveTab('basic');
  };

  const handleAddImage = async () => {
    if (!newImage.image_url.trim()) {
      toast.error('Please enter an image URL');
      return;
    }

    if (editingProduct) {
      // For existing products, add directly to database
      try {
        const response = await api.post(`/api/products/${editingProduct.id}/images`, newImage);
        if (response.data.success) {
          toast.success('Image added successfully');
          setNewImage({ image_url: '', alt_text: '', sort_order: 0, is_primary: false });
          fetchProducts(); // Refresh to get updated data
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
          fetchProducts(); // Refresh to get updated data
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

  const handleAddColor = async () => {
    if (!newColor.color_name.trim()) {
      toast.error('Please enter a color name');
      return;
    }

    if (editingProduct) {
      // For existing products, add directly to database
      try {
        const response = await api.post(`/api/products/${editingProduct.id}/colors`, newColor);
        if (response.data.success) {
          toast.success('Color added successfully');
          setNewColor({ color_name: '', color_code: '', color_image_url: '', price_adjustment: 0, stock: 0, is_available: true, sort_order: 0 });
          fetchProducts(); // Refresh to get updated data
        }
      } catch (error) {
        console.error('Error adding color:', error);
        toast.error('Failed to add color');
      }
    } else {
      // For new products, add to local state
      const newColorWithId = {
        ...newColor,
        id: Date.now(), // Temporary ID for local state
        product_id: null
      };
      setProductColors([...productColors, newColorWithId]);
      setNewColor({ color_name: '', color_code: '', color_image_url: '', price_adjustment: 0, stock: 0, is_available: true, sort_order: 0 });
      toast.success('Color added to product (will be saved when product is created)');
    }
  };

  const handleDeleteColor = async (colorId) => {
    if (editingProduct) {
      // For existing products, delete from database
      try {
        const response = await api.delete(`/api/products/colors/${colorId}`);
        if (response.data.success) {
          toast.success('Color deleted successfully');
          fetchProducts(); // Refresh to get updated data
        }
      } catch (error) {
        console.error('Error deleting color:', error);
        toast.error('Failed to delete color');
      }
    } else {
      // For new products, remove from local state
      setProductColors(productColors.filter(color => color.id !== colorId));
      toast.success('Color removed from product');
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
      if (productImages.length > 0 && productId) {
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
      if (productColors.length > 0 && productId) {
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
      if (enableTypeSelection && typeSelectionOptions.length > 0 && productId) {
        for (const option of typeSelectionOptions) {
          try {
            const colorData = {
              color_name: option.name,
              color_code: null,
              color_image_url: null,
              price_adjustment: option.price_adjustment,
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

      handleCloseModal();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(error.response?.data?.message || 'Failed to save product');
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
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

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
        <button
          onClick={() => handleOpenModal()}
          className="btn bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
        >
          <FaPlus /> Add New Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            />
          </div>

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
          >
            <option value="all">All Brands</option>
            {brands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      </div>

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
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                {product.image_url ? (
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
                  { id: 'colors', label: 'Colors', icon: FaPalette }
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

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
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

              {/* Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Image
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const data = new FormData();
                      data.append('image', file);
                      try {
                        const res = await api.post('/api/upload', data, {
                          headers: { 'Content-Type': 'multipart/form-data' }
                        });
                        setFormData({ ...formData, image_url: res.data.url });
                        toast.success('Image uploaded');
                      } catch (err) {
                        console.error('Upload failed', err);
                        toast.error('Image upload failed');
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  {formData.image_url && (
                    <img src={formData.image_url} alt="preview" className="w-16 h-16 object-cover rounded" />
                  )}
                </div>
                {formData.image_url && (
                  <p className="text-xs text-gray-500 mt-1 break-all">{formData.image_url}</p>
                )}
              </div>

              {/* Type Selection Section */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="enableTypeSelection"
                    checked={enableTypeSelection}
                    onChange={(e) => setEnableTypeSelection(e.target.checked)}
                    className="w-4 h-4 text-secondary focus:ring-secondary border-gray-300 rounded"
                  />
                  <label htmlFor="enableTypeSelection" className="text-sm font-semibold text-gray-700">
                    Enable Type Selection (e.g., Size, Color, Model)
                  </label>
                </div>

                {enableTypeSelection && (
                  <div className="space-y-4">
                    {/* Type Selection Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type Selection Title *
                      </label>
                      <input
                        type="text"
                        value={typeSelectionTitle}
                        onChange={(e) => setTypeSelectionTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                        placeholder="e.g., Size, Color, Model, Type"
                        required={enableTypeSelection}
                      />
                    </div>

                    {/* Add Type Option */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-700 mb-3">Add Type Option</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price Adjustment (RM)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={newTypeOption.price_adjustment}
                            onChange={(e) => setNewTypeOption({...newTypeOption, price_adjustment: parseFloat(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                            placeholder="0.00"
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
                        Add Type Option
                      </button>
                    </div>

                    {/* Existing Type Options */}
                    {typeSelectionOptions.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-3">Type Options ({typeSelectionOptions.length})</h5>
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
                              <div className="text-sm text-gray-600 space-y-1">
                                <div>Price: {option.price_adjustment > 0 ? '+' : ''}RM {option.price_adjustment}</div>
                                <div>Stock: {option.stock}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Buttons */}
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
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
              )}

              {/* Images Tab */}
              {activeTab === 'images' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-4">Product Images</h4>
                    
                    {/* Add New Image */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h5 className="font-medium text-gray-700 mb-3">Add New Image</h5>
                      
                      {/* Upload Method Selection */}
                      <div className="mb-4">
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="uploadMethod"
                              value="url"
                              defaultChecked
                              className="text-secondary focus:ring-secondary"
                            />
                            <span className="text-sm font-medium">Image URL</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="uploadMethod"
                              value="file"
                              className="text-secondary focus:ring-secondary"
                            />
                            <span className="text-sm font-medium">Upload File</span>
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL *</label>
                          <input
                            type="url"
                            value={newImage.image_url}
                            onChange={(e) => setNewImage({...newImage, image_url: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                            placeholder="https://example.com/image.jpg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Or Upload File</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const data = new FormData();
                              data.append('image', file);
                              try {
                                const res = await api.post('/api/upload', data, {
                                  headers: { 'Content-Type': 'multipart/form-data' }
                                });
                                setNewImage({...newImage, image_url: res.data.url});
                                toast.success('Image uploaded successfully');
                              } catch (err) {
                                console.error('Upload failed', err);
                                toast.error('Image upload failed');
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                          />
                        </div>
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
                      <button
                        type="button"
                        onClick={handleAddImage}
                        className="mt-3 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors"
                      >
                        <FaPlus className="inline mr-2" />
                        Add Image
                      </button>
                    </div>

                    {/* Existing Images */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {productImages.map((image, index) => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.image_url}
                            alt={image.alt_text || formData.name || 'Product image'}
                            className="w-full h-32 object-cover rounded-lg"
                          />
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
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Colors Tab */}
              {activeTab === 'colors' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-primary mb-4">Product Colors</h4>
                    
                    {/* Add New Color */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h5 className="font-medium text-gray-700 mb-3">Add New Color</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Color Name *</label>
                          <input
                            type="text"
                            value={newColor.color_name}
                            onChange={(e) => setNewColor({...newColor, color_name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                            placeholder="e.g., Red, Blue, Black"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Color Code</label>
                          <input
                            type="text"
                            value={newColor.color_code}
                            onChange={(e) => setNewColor({...newColor, color_code: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                            placeholder="#FF0000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Color Image URL</label>
                          <input
                            type="url"
                            value={newColor.color_image_url}
                            onChange={(e) => setNewColor({...newColor, color_image_url: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                            placeholder="https://example.com/color-image.jpg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price Adjustment (RM)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={newColor.price_adjustment}
                            onChange={(e) => setNewColor({...newColor, price_adjustment: parseFloat(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                          <input
                            type="number"
                            value={newColor.stock}
                            onChange={(e) => setNewColor({...newColor, stock: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                          <input
                            type="number"
                            value={newColor.sort_order}
                            onChange={(e) => setNewColor({...newColor, sort_order: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary"
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={newColor.is_available}
                            onChange={(e) => setNewColor({...newColor, is_available: e.target.checked})}
                            className="rounded border-gray-300 text-secondary focus:ring-secondary"
                          />
                          <span className="text-sm text-gray-700">Available</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleAddColor}
                          className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors"
                        >
                          <FaPlus className="inline mr-2" />
                          Add Color
                        </button>
                      </div>
                    </div>

                    {/* Existing Colors */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {productColors.map((color) => (
                        <div key={color.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {color.color_code && (
                                <div
                                  className="w-6 h-6 rounded-full border border-gray-300"
                                  style={{ backgroundColor: color.color_code }}
                                ></div>
                              )}
                              <span className="font-medium">{color.color_name}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteColor(color.id)}
                              className="p-1 text-red-500 hover:text-red-700 transition-colors"
                            >
                              <FaTrash className="text-sm" />
                            </button>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Price: {color.price_adjustment > 0 ? '+' : ''}RM {color.price_adjustment}</div>
                            <div>Stock: {color.stock}</div>
                            <div>Status: {color.is_available ? 'Available' : 'Unavailable'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  {activeTab === 'basic' ? 'Cancel' : 'Close'}
                </button>
                {activeTab === 'basic' && (
                  <button
                    type="submit"
                    form="product-form"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-secondary to-secondary-dark text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;

