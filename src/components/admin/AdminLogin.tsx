import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertCircle, Sparkles, KeyRound, Database, HelpCircle } from 'lucide-react';
import { signInAdmin } from '../../lib/supabase';

interface AdminLoginProps {
  isSupabase: boolean;
  onLoginSuccess: () => void;
  onViewSetupGuide: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  isSupabase,
  onLoginSuccess,
  onViewSetupGuide,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isSupabase) {
      setError(
        'Supabase backend is not configured yet. To enable administrative login and secure database access, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
      );
      return;
    }

    setIsLoading(true);

    try {
      const { user, error: loginError } = await signInAdmin(email, password);
      if (loginError) {
        setError(loginError);
      } else if (user) {
        onLoginSuccess();
      } else {
        setError('Invalid credentials or unauthorized user.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 text-left max-w-md mx-auto space-y-6">
      {/* Icon & Title */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-[#FFF0F3] border border-[#F5B8C7] text-[#8B4F58] flex items-center justify-center mx-auto shadow-xs">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h3 className="font-heading text-2xl font-bold text-[#1F1A1C]">
          Owner Management Portal
        </h3>
        <p className="text-xs text-[#6E6267]">
          Secure administrative access for <strong>Akshaysinh Kher</strong>
        </p>
      </div>

      {/* Supabase Status Banner */}
      {isSupabase ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Connected to Supabase Database & Auth</span>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-800">
            <Database className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Supabase Configuration Required</span>
          </div>
          <p className="leading-relaxed">
            Administrative access is protected by Supabase Authentication. Set <code className="bg-amber-100/80 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code> and <code className="bg-amber-100/80 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> in <code className="bg-amber-100/80 px-1 py-0.5 rounded">.env</code> to log in.
          </p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#4A3F44] mb-1">
            Admin Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              required
              placeholder="owner@vaidehi-imitation.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#F0C9D3] text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B76E79]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#4A3F44] mb-1">
            Admin Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#F0C9D3] text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B76E79]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4A373] via-[#B76E79] to-[#9E5863] text-white font-semibold text-xs sm:text-sm shadow-md hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <KeyRound className="w-4 h-4" />
          <span>{isLoading ? 'Verifying Credentials...' : 'Sign In as Administrator'}</span>
        </button>
      </form>

      {/* Setup Guide Button */}
      <div className="pt-2 text-center border-t border-gray-100">
        <button
          type="button"
          onClick={onViewSetupGuide}
          className="text-xs text-[#8B4F58] hover:underline font-medium inline-flex items-center gap-1.5 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Need help setting up Supabase credentials? View Guide</span>
        </button>
      </div>
    </div>
  );
};

