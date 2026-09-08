import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  Fingerprint,
  RotateCcw,
  Building2,
  Crown
} from 'lucide-react';
import doraLogo from '@/assets/dora_logo.png';

const VAULT_SESSION_KEY = 'dora_owner_vault_unlocked';
const DEFAULT_PIN = '7799';
const MASTER_PASSWORDS = ['dora#owner2026', 'dora2026', '7799'];

export default function OwnerSecurityGate({ onUnlock, isUnlocked }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleDigitClick = (digit) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError('');
      if (nextPin === DEFAULT_PIN) {
        authenticateSuccess();
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    setPin('');
    setError('');
  };

  const authenticateSuccess = () => {
    sessionStorage.setItem(VAULT_SESSION_KEY, 'true');
    setError('');
    onUnlock();
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (MASTER_PASSWORDS.includes(pin.trim())) {
      authenticateSuccess();
    } else {
      setError('رمز الدخول غير صحيح، حاول مرة أخرى');
      setAttempts((prev) => prev + 1);
      setPin('');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4" dir="rtl">
      <div className="relative w-full max-w-md bg-[#0A0F1D] border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center overflow-hidden">
        {/* Subtle executive glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand & Crown Badge */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-amber-600/20 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Crown className="w-8 h-8 text-amber-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-slate-950 rounded-full border border-amber-500/50">
              <Lock className="w-3.5 h-3.5 text-amber-300" />
            </div>
          </div>

          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>الخزنة التنفيذية لمالك الشركة</span>
          </h1>
          <p className="text-xs text-amber-200/70 mt-1 font-medium">
            نظام حماية مقيد · درة السيارة لقطع غيار هيونداي وكيا
          </p>
        </div>

        {/* PIN Dots Indicator */}
        <div className="my-6">
          <div className="flex justify-center items-center gap-3">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    isFilled
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-md shadow-amber-500/50 scale-110'
                      : 'border-2 border-slate-700 bg-slate-900'
                  }`}
                />
              );
            })}
          </div>

          {/* Form / Direct Text input fallback */}
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="relative max-w-[200px] mx-auto">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="أدخل الرمز السري..."
                maxLength={16}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-center font-mono text-sm tracking-widest text-amber-300 outline-none focus:border-amber-500/60"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-rose-400 font-bold animate-shake">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Numeric Keypad (4x3) */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigitClick(num.toString())}
              className="h-12 rounded-xl bg-slate-900/90 hover:bg-amber-500/15 text-slate-100 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 text-lg font-mono font-black transition-all active:scale-95 cursor-pointer flex items-center justify-center shadow-xs"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-xl bg-slate-950 text-slate-500 hover:text-rose-400 border border-slate-800 text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center"
          >
            مسح
          </button>
          <button
            type="button"
            onClick={() => handleDigitClick('0')}
            className="h-12 rounded-xl bg-slate-900/90 hover:bg-amber-500/15 text-slate-100 hover:text-amber-300 border border-slate-800 hover:border-amber-500/40 text-lg font-mono font-black transition-all active:scale-95 cursor-pointer flex items-center justify-center"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-xl bg-slate-950 text-slate-500 hover:text-amber-300 border border-slate-800 text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center justify-center"
          >
            ⌫
          </button>
        </div>

        {/* Fast Unlock Action Button */}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-black text-sm transition-all shadow-lg shadow-amber-500/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Unlock className="w-4 h-4" />
          <span>فتح الخزنة التنفيذية</span>
        </button>

        {/* Security Notice */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            تشفير الجلسة نشط
          </span>
          <span className="text-[10px] text-slate-400 font-mono">الرمز الافتراضي: 7799</span>
        </div>
      </div>
    </div>
  );
}
