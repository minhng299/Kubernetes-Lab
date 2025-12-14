import React, { useState, useEffect } from 'react';
import api from '../api/api';

export default function ProductForm({ product, onSuccess }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setCategory(product.category || '');
      setDescription(product.description || '');
      setPrice(product.price || '');
      setStock(product.stock || '');
    } else {
      resetForm();
    }
  }, [product]);

  const resetForm = () => {
    setName('');
    setCategory('');
    setDescription('');
    setPrice('');
    setStock('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !category.trim() || !price || !stock) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    try {
      const productData = { 
        name: name.trim(), 
        category: category.trim(), 
        description: description.trim(), 
        price: parseFloat(price), 
        stock: parseInt(stock) 
      };
      
      if (product?.id) {
        await api.put(`/products/${product.id}`, productData);
        alert('Product updated successfully!');
      } else {
        await api.post('/products', productData);
        alert('Product added successfully!');
        resetForm();
      }
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded mb-4">
      <input 
        placeholder="Product Name *" 
        value={name} 
        onChange={e => setName(e.target.value)} 
        className="w-full p-2 mb-2 border rounded focus:border-blue-500 focus:outline-none" 
        required
        disabled={isLoading}
      />
      <input 
        placeholder="Category *" 
        value={category} 
        onChange={e => setCategory(e.target.value)} 
        className="w-full p-2 mb-2 border rounded focus:border-blue-500 focus:outline-none" 
        required
        disabled={isLoading}
      />
      <textarea 
        placeholder="Description" 
        value={description} 
        onChange={e => setDescription(e.target.value)} 
        className="w-full p-2 mb-2 border rounded focus:border-blue-500 focus:outline-none" 
        rows="3"
        disabled={isLoading}
      ></textarea>
      <input 
        type="number" 
        placeholder="Price *" 
        value={price} 
        onChange={e => setPrice(e.target.value)} 
        className="w-full p-2 mb-2 border rounded focus:border-blue-500 focus:outline-none" 
        step="0.01"
        min="0"
        required
        disabled={isLoading}
      />
      <input 
        type="number" 
        placeholder="Stock Quantity *" 
        value={stock} 
        onChange={e => setStock(e.target.value)} 
        className="w-full p-2 mb-2 border rounded focus:border-blue-500 focus:outline-none" 
        min="0"
        required
        disabled={isLoading}
      />
      <button 
        type="submit" 
        className="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-colors disabled:bg-gray-400"
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : (product?.id ? 'Update' : 'Add')} Product
      </button>
      {product?.id && (
        <button 
          type="button" 
          onClick={() => { resetForm(); onSuccess(); }} 
          className="w-full mt-2 bg-gray-500 hover:bg-gray-600 text-white p-2 rounded transition-colors"
          disabled={isLoading}
        >
          Cancel
        </button>
      )}
    </form>
  );
}
