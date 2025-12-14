import React, { useState, useEffect } from 'react';
import api from '../api/api';

export default function UserProfile({ onClose }) {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setProfile(res.data);
    } catch (err) {
      alert('Failed to load profile');
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await api.put('/users/profile', profile);
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    
    setIsLoading(true);
    try {
      await api.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      alert('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">User Profile</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Profile Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={e => setProfile({...profile, name: e.target.value})}
              disabled={!isEditing}
              className="w-full p-2 border rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full p-2 border rounded-lg bg-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={profile.phone || ''}
              onChange={e => setProfile({...profile, phone: e.target.value})}
              disabled={!isEditing}
              className="w-full p-2 border rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              value={profile.address || ''}
              onChange={e => setProfile({...profile, address: e.target.value})}
              disabled={!isEditing}
              rows={3}
              className="w-full p-2 border rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
              >
                Edit Profile
              </button>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg"
              >
                Change Password
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSaveProfile}
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg disabled:bg-gray-400"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => { setIsEditing(false); fetchProfile(); }}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Change Password Form */}
        {showPasswordForm && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Change Password</h3>
            <div className="space-y-3">
              <input
                type="password"
                placeholder="Current Password"
                value={passwordData.currentPassword}
                onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                className="w-full p-2 border rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordData.newPassword}
                onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                className="w-full p-2 border rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                className="w-full p-2 border rounded-lg focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={handleChangePassword}
                disabled={isLoading}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg disabled:bg-gray-400"
              >
                {isLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}