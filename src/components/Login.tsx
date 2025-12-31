import React, { useState } from 'react';
import { LogIn, Shield, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface LoginProps {
  onLogin: (userData: { name: string; email: string; role: 'admin' | 'employee' }) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setIsLoading(true);

    try {
      // التحقق من بيانات الاعتماد الحقيقية
      if (email === 'admin@mahwous.com' && password === '778899') {
        onLogin({
          name: 'مدير النظام',
          email: 'admin@mahwous.com',
          role: 'admin',
        });
        toast.success('مرحباً بك مدير النظام! 👑');
        return;
      } else if (email === 'mahwosaamed@gmail.com' && password === '772350352') {
        onLogin({
          name: 'أحمد - موظف',
          email: 'mahwosaamed@gmail.com',
          role: 'employee',
        });
        toast.success('مرحباً بك أحمد! 👋');
        return;
      } else {
        toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        return;
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      toast.error('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#D4AF37] opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-[#D4AF37] opacity-5 rounded-full blur-3xl"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-[#B8941F] rounded-2xl mb-4 shadow-[0_4px_20px_rgba(212,175,55,0.3)]">
            <Shield className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            مهووس <span className="text-[#D4AF37]">برو</span>
          </h1>
          <p className="text-[#B0B0B0]">نظام إدارة متقدم للعطور الفاخرة</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#252525] border border-[rgba(212,175,55,0.2)] rounded-2xl p-8 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mahwous.com"
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[rgba(212,175,55,0.2)] rounded-xl text-white placeholder-[#707070] focus:outline-none focus:border-[#D4AF37] transition-all duration-200"
                disabled={isLoading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#1A1A1A] border border-[rgba(212,175,55,0.2)] rounded-xl text-white placeholder-[#707070] focus:outline-none focus:border-[#D4AF37] transition-all duration-200"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707070] hover:text-[#D4AF37] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-xl hover:bg-[#E5C158] active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-[rgba(212,175,55,0.2)]">
            <p className="text-[#707070] text-sm text-center mb-3">حسابات النظام:</p>
            <div className="space-y-2 text-xs">
              <div className="bg-[#1A1A1A] p-3 rounded-lg">
                <p className="text-[#D4AF37] font-medium mb-1">👑 مدير النظام</p>
                <p className="text-[#B0B0B0]">admin@mahwous.com</p>
                <p className="text-[#B0B0B0]">كلمة السر: 778899</p>
              </div>
              <div className="bg-[#1A1A1A] p-3 rounded-lg">
                <p className="text-[#D4AF37] font-medium mb-1">👤 موظف</p>
                <p className="text-[#B0B0B0]">mahwosaamed@gmail.com</p>
                <p className="text-[#B0B0B0]">كلمة السر: 772350352</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-[#707070] text-sm">
            طور بواسطة{' '}
            <span className="text-[#D4AF37] font-medium">شركة مهووس البرمجية</span>
          </p>
        </div>
      </div>
    </div>
  );
}
