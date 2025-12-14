import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserProfile from './UserProfile';

export default function Navbar() {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      alert('Logged out successfully!');
      navigate('/');
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-xl font-bold text-gray-800 hover:text-blue-600"
            >
              OCOP Products
            </Link>
            
            {isLoggedIn && (
              <div className="hidden md:flex space-x-6">
                <Link 
                  to="/dashboard" 
                  className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700">
                    Welcome, <span className="font-medium">{user.name || user.email}</span>
                  </span>
                  
                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowProfile(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-sm"
                    >
                      Profile
                    </button>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex space-x-3">
                <Link 
                  to="/login" 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* User Profile Modal */}
      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}
    </nav>
  );
}
