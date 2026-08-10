import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminApi } from '../../services/api.js';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminApi.post('/admin/login', { email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md">
        <div className="border border-white/10 bg-white/[0.02] p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl text-white mb-2">NOIR</h1>
            <p className="text-xs uppercase tracking-[0.3em] text-noir-gold">Admin Portal</p>
          </div>

          {error && (
            <div className="mb-6 p-4 border border-red-500/50 bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-noir-muted mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border border-white/20 px-4 py-3 text-white focus:border-noir-gold focus:outline-none transition-colors"
                placeholder="admin@noirsalon.in"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.2em] text-noir-muted mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-white/20 px-4 py-3 text-white focus:border-noir-gold focus:outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full border border-noir-gold px-8 py-3.5 text-xs uppercase tracking-[0.25em] text-noir-gold hover:bg-noir-gold hover:text-black transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
