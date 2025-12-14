import React, { useState } from 'react';
import api from '../api/api';

export default function ForgotPassword({ onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('email'); // email, reset
  const [resetData, setResetData] = useState({
    token: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      alert('Password reset instructions sent to your email!');
      setStep('reset');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetData.newPassword !== resetData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (resetData.newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token: resetData.token,
        newPassword: resetData.newPassword
      });
      alert('Password reset successfully! You can now login with your new password.');
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Password Reset</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleSendResetEmail}>
            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                Enter your email address and we'll send you instructions to reset your password.
              </p>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium disabled:bg-gray-400"
              >
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <p className="text-green-600 text-sm">
                Reset instructions sent! Check your email for the reset token.
              </p>
              
              <div>
                <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
                  Reset Token (from email)
                </label>
                <input
                  type="text"
                  id="token"
                  value={resetData.token}
                  onChange={(e) => setResetData({...resetData, token: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Enter reset token from email"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={resetData.newPassword}
                  onChange={(e) => setResetData({...resetData, newPassword: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Enter new password"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={resetData.confirmPassword}
                  onChange={(e) => setResetData({...resetData, confirmPassword: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-medium disabled:bg-gray-400"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-medium"
              >
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}