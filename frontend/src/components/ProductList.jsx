import React, { useEffect, useState } from 'react';
import api from '../api/api';
import ProductForm from './ProductForm';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  
  // Search and filter states
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    inStock: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    page: 1,
    limit: 10
  });

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null) {
          params.append(key, value);
        }
      });
      
      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data.products || res.data); // Handle both paginated and simple responses
      
      if (res.data.pagination) {
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError('Failed to fetch products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchProducts(); 
  }, [filters]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        alert('Product deleted successfully!');
        fetchProducts();
      } catch (err) {
        alert('Failed to delete product. Please try again.');
        console.error('Error deleting product:', err);
      }
    }
  };

  const handleEditSuccess = () => {
    setEditProduct(null);
    fetchProducts();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>{error}</p>
        <button 
          onClick={fetchProducts} 
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-lg font-semibold mb-4">Search & Filter Products</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search products..."
            value={filters.search}
            onChange={e => handleFilterChange('search', e.target.value)}
            className="p-2 border rounded-lg focus:border-blue-500 focus:outline-none"
          />
          
          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={e => handleFilterChange('category', e.target.value)}
            className="p-2 border rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="Food">Food</option>
            <option value="Handicraft">Handicraft</option>
            <option value="Textile">Textile</option>
            <option value="Agriculture">Agriculture</option>
          </select>
          
          {/* Price Range */}
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={e => handleFilterChange('minPrice', e.target.value)}
            className="p-2 border rounded-lg focus:border-blue-500 focus:outline-none"
          />
          
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={e => handleFilterChange('maxPrice', e.target.value)}
            className="p-2 border rounded-lg focus:border-blue-500 focus:outline-none"
          />
          
          {/* Stock Filter */}
          <select
            value={filters.inStock}
            onChange={e => handleFilterChange('inStock', e.target.value)}
            className="p-2 border rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Stock</option>
            <option value="true">In Stock</option>
            <option value="false">Out of Stock</option>
          </select>
          
          {/* Sort */}
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={e => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              handleFilterChange('sortBy', sortBy);
              handleFilterChange('sortOrder', sortOrder);
            }}
            className="p-2 border rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="createdAt-DESC">Newest First</option>
            <option value="createdAt-ASC">Oldest First</option>
            <option value="price-ASC">Price: Low to High</option>
            <option value="price-DESC">Price: High to Low</option>
            <option value="name-ASC">Name: A to Z</option>
            <option value="stock-ASC">Stock: Low to High</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Products ({pagination.total})</h2>
        <div className="flex space-x-2">
          <button 
            onClick={fetchProducts} 
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
      </div>
      
      {editProduct && (
        <div className="mb-6 bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Edit Product</h3>
          <ProductForm product={editProduct} onSuccess={handleEditSuccess} />
        </div>
      )}
      
      {products.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No products found. Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left border-b">Name</th>
                  <th className="p-3 text-left border-b">Category</th>
                  <th className="p-3 text-left border-b">Price</th>
                  <th className="p-3 text-left border-b">Stock</th>
                  <th className="p-3 text-center border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        {p.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {p.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">{p.category}</td>
                    <td className="p-3">
                      <span className="font-semibold">${parseFloat(p.price).toFixed(2)}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        p.stock > 10 ? 'bg-green-100 text-green-800' : 
                        p.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button 
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded mr-2 text-sm"
                        onClick={() => setEditProduct(p)}
                      >
                        Edit
                      </button>
                      <button 
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-4 flex justify-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 rounded ${
                    pagination.page === i + 1 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
