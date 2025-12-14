import React from 'react';
import Navbar from '../components/Navbar';
import Dashboard from '../components/Dashboard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar/>
      <Dashboard/>
    </div>
  )
}
