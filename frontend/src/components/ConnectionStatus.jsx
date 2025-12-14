import React, { useState, useEffect } from 'react';
import api from '../api/api';

const ConnectionStatus = () => {
  const [status, setStatus] = useState('checking');
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setStatus('checking');
    setApiUrl(import.meta.env.VITE_API_URL || 'http://localhost:31998/api');
    
    try {
      // Try to ping the backend (you can create a simple health endpoint)
      await api.get('/health').catch(() => {
        // If health endpoint doesn't exist, try any endpoint
        throw new Error('Connection failed');
      });
      setStatus('connected');
    } catch (error) {
      setStatus('disconnected');
      console.error('Backend connection failed:', error);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'disconnected': return 'Disconnected';
      default: return 'Checking...';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-3 border">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          API: {apiUrl}
        </div>
        <button 
          onClick={checkConnection}
          className="text-xs text-blue-500 hover:text-blue-700 mt-1"
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default ConnectionStatus;