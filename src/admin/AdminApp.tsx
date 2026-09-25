import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';

export default function AdminApp() {
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing tokens to enforce the new requirement
    localStorage.removeItem('admin_token');
    
    if (!token) {
      navigate('/admin/login');
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans admin-ui">
      <Routes>
        <Route path="login" element={<Login setToken={setToken} />} />
        <Route path="*" element={token ? <Dashboard setToken={setToken} token={token} /> : <Login setToken={setToken} />} />
      </Routes>
    </div>
  );
}
