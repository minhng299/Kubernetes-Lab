import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center h-screen text-white px-4">
        <div className="text-center max-w-4xl">
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            OCOP Products
            <span className="block text-4xl font-normal mt-2 text-blue-200">
              Management System
            </span>
          </h1>
          
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Streamline your One Commune One Product business with our comprehensive 
            management platform. Track inventory, manage products, and grow your business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/login" 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all shadow-lg transform hover:scale-105"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all transform hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="absolute bottom-8 left-0 right-0">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl mb-3">📦</div>
              <h3 className="text-lg font-semibold mb-2">Product Management</h3>
              <p className="text-sm text-blue-100">Easily add, edit, and organize your OCOP products</p>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold mb-2">Inventory Tracking</h3>
              <p className="text-sm text-blue-100">Keep track of stock levels and product availability</p>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-3xl mb-3">💼</div>
              <h3 className="text-lg font-semibold mb-2">Business Growth</h3>
              <p className="text-sm text-blue-100">Tools to help scale your local business</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
