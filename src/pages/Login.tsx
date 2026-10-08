import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Compass, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'student') navigate('/student/preferences');
      else if (user.role === 'landlord') navigate('/landlord/dashboard');
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/recommendations');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
            <Compass className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white">Sign In to Smart Bodim</h2>
          <p className="mt-1 text-xs text-slate-400">Access your personalized recommendations & dashboard</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@university.lk"
              className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition-all hover:opacity-95 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="pt-4 text-center border-t border-slate-800 text-xs text-slate-400">
          Demo Quick Sign In:
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => { setEmail('kasun.f@student.lk'); setPassword('Student123!'); }}
              className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] text-cyan-300 hover:bg-slate-700"
            >
              Student Demo
            </button>
            <button
              onClick={() => { setEmail('bandara.g@gmail.com'); setPassword('Landlord123!'); }}
              className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] text-amber-300 hover:bg-slate-700"
            >
              Landlord Demo
            </button>
            <button
              onClick={() => { setEmail('admin@smartbodim.lk'); setPassword('Admin123!'); }}
              className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] text-rose-300 hover:bg-slate-700"
            >
              Admin Demo
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-cyan-400 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
