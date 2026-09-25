import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login({ setToken }: { setToken: (t: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const contentType = res.headers.get('content-type');
        if (res.ok && contentType?.includes('application/json')) {
          const data = await res.json();
          setToken(data.token);
          navigate('/admin');
          return;
        } else if (!res.ok && contentType?.includes('application/json')) {
          const data = await res.json();
          setError(data.error || 'Invalid credentials');
          return;
        }
      } catch (err) {
        console.warn('Backend login route unavailable, attempting client authentication fallback', err);
      }

      // Fallback for static Netlify deployments where server backend is not present
      const validUsername = 'indrajit';
      const validPassword = 'indrajit123??';
      if (username === validUsername && password === validPassword) {
        const clientToken = 'static_admin_token_' + Date.now();
        setToken(clientToken);
        navigate('/admin');
      } else {
        setError('Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF9F5] px-4 admin-ui">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-pink-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-pink-500 font-medium mt-2 text-sm uppercase tracking-wider">Birthday Website Management</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin ID</label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all pr-12"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 rounded-xl shadow-md transition-all flex justify-center items-center h-12"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
