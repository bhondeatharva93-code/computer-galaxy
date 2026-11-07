import React, { useState } from 'react';
import { Lock, Mail, ShieldAlert, ArrowRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

interface AdminLoginProps {
  onSuccess: (user: any) => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBackToStore }) => {
  const [email, setEmail] = useState('admin@computergalaxy.in');
  const [password, setPassword] = useState('GalaxyAdmin@2026');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.loginAdmin(email, password);
      if (res.success && res.user) {
        onSuccess(res.user);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify admin credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-[#783D1B] selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Logo and Brand Title */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#783D1B] text-white font-extrabold text-2xl shadow-md mb-3 ring-4 ring-[#783D1B]/15">
            CG
          </div>
          <h2 className="text-2xl font-extrabold text-[#172B4D] tracking-tight">
            Computer Galaxy Administration
          </h2>
          <p className="mt-1 text-xs text-[#64748B]">
            Authorized personnel portal with server-side access control
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-white py-8 px-4 shadow-xl border border-slate-200 sm:rounded-2xl sm:px-10">
          
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-shake">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#172B4D] uppercase tracking-wider mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#783D1B] focus:border-transparent transition-all"
                  placeholder="admin@computergalaxy.in"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Protected</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-[#172B4D] focus:outline-none focus:ring-2 focus:ring-[#783D1B] focus:border-transparent transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {/* Quick prefill tip for testing */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-[11px] text-[#783D1B] flex items-center justify-between">
              <div>
                <span className="font-bold block">Default System Credentials:</span>
                <span className="font-mono text-[10px] text-slate-600">admin@computergalaxy.in | GalaxyAdmin@2026</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@computergalaxy.in');
                  setPassword('GalaxyAdmin@2026');
                }}
                className="text-[10px] font-bold underline cursor-pointer hover:text-[#5C2E13]"
              >
                Autofill
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#783D1B] hover:bg-[#5C2E13] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200 text-center">
            <button
              type="button"
              onClick={onBackToStore}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#783D1B] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Computer Galaxy Storefront</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
