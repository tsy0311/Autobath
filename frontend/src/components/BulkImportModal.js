import React, { useState } from 'react';
import { FaTimes, FaUpload, FaDownload, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const BulkImportModal = ({ isOpen, onClose, onImportComplete }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importType, setImportType] = useState('chinese-names');

  const handleBulkImport = async () => {
    setIsImporting(true);
    try {
      const response = await api.post('/api/products/bulk-import', {
        type: importType
      });
      
      if (response.data.success) {
        toast.success(`Successfully imported ${response.data.count} products!`);
        onImportComplete?.();
        onClose();
      } else {
        toast.error('Bulk import failed');
      }
    } catch (error) {
      console.error('Bulk import error:', error);
      toast.error('Failed to import products');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    // Create a CSV template for manual import
    const template = `name,brand,price,stock,description,category
Metal Sprayer 原液壶,An-Riddle,58,10,Professional metal sprayer for car detailing,Tools
Washing Brush Tool Set (3pcs) 细节刷三件套,An-Riddle,28,25,Complete brush set for detailed cleaning,Tools
Washing Glove 纤维手套,An-Riddle,16,50,High-quality washing gloves,Accessories`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Bulk Import Products</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Import Type
            </label>
            <select
              value={importType}
              onChange={(e) => setImportType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="chinese-names">Chinese Names & Stock Update</option>
              <option value="all-products">All Products (Full Import)</option>
            </select>
          </div>

          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="font-semibold text-blue-900 mb-2">What this will do:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Update existing products with Chinese names</li>
              <li>• Set correct stock levels for all products</li>
              <li>• Add product variants (sizes, colors)</li>
              <li>• Import new products if missing</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={downloadTemplate}
              className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              <FaDownload className="mr-2" />
              Download Template
            </button>
            
            <button
              onClick={handleBulkImport}
              disabled={isImporting}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isImporting ? (
                <FaSpinner className="mr-2 animate-spin" />
              ) : (
                <FaUpload className="mr-2" />
              )}
              {isImporting ? 'Importing...' : 'Start Import'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImportModal;

