import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

const VAULT_SESSION_KEY = 'dora_owner_vault_unlocked';
const DEFAULT_PIN = '7799';
const MASTER_PASSWORDS = ['dora#owner2026', 'dora2026', '7799'];

export default function OwnerSecurityGate({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [showPin, setShowPin] = useState(false);

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
      setError('الرمز غير صحيح، أعد المحاولة');
      setPin('');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-[#F8FAFC]" dir="rtl">
      {/* Hand-drawn / Sketchy Architectural Blueprint Card with SHARP CORNERS */}
      <div className="relative w-full max-w-md bg-white border-2 border-slate-900 p-6 sm:p-8 shadow-[6px_6px_0px_0px_#0F172A] rounded-none text-center">
        
        {/* Hand-drawn Sketchy SVG Lock Doodle */}
        <div className="flex justify-center mb-4">
          <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Shackle: sketchy curved arc */}
            <path d="M22 28V18C22 12.5 26.5 8 32 8C37.5 8 42 12.5 42 18V28" strokeDasharray="1 0" />
            {/* Body: sharp rectangle with sketch lines */}
            <rect x="14" y="28" width="36" height="28" fill="#F1F5F9" />
            {/* Keyhole */}
            <circle cx="32" cy="40" r="3" fill="#0F172A" />
            <path d="M32 43V48" strokeWidth="3" />
            {/* Sketch Accent Marks */}
            <path d="M18 34L26 34" stroke="#94A3B8" strokeWidth="1.5" />
            <path d="M18 38L24 38" stroke="#94A3B8" strokeWidth="1.5" />
            <path d="M48 20L54 16" stroke="#EAB308" strokeWidth="2" />
            <path d="M51 25L57 23" stroke="#EAB308" strokeWidth="2" />
          </svg>
        </div>

        {/* Title & Handwritten subheader */}
        <div className="border-b-2 border-dashed border-slate-300 pb-3 mb-5">
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            بوابة الخزنة — صاحب الشركة
          </h1>
          <p className="text-xs text-slate-600 mt-1 font-mono font-bold">
            [ وصول مقيد ومحمي برموز أمان خاصة ]
          </p>
        </div>

        {/* PIN Boxes - Sharp Rectangles */}
        <div className="mb-6">
          <div className="flex justify-center items-center gap-2 mb-4">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-10 h-12 border-2 border-slate-900 rounded-none flex items-center justify-center font-mono text-xl font-black transition-all ${
                    isFilled
                      ? 'bg-amber-100 text-slate-950 shadow-[2px_2px_0px_0px_#0F172A]'
                      : 'bg-slate-50 text-transparent'
                  }`}
                >
                  {isFilled ? (showPin ? pin[idx] : '●') : ''}
                </div>
              );
            })}
          </div>

          {/* Fallback Direct Input */}
          <form onSubmit={handleSubmit} className="flex items-center justify-center gap-2">
            <div className="relative w-44">
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="أدخل الرمز (7799)"
                maxLength={10}
                className="w-full bg-slate-50 border-2 border-slate-800 rounded-none px-3 py-1.5 text-center font-mono text-xs font-bold text-slate-900 outline-none focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
              >
                {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-2.5 flex items-center justify-center gap-1 text-xs text-rose-600 font-bold">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Tactile Keypad - Sharp rectangular buttons with hard drop shadow */}
        <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto mb-5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigitClick(num.toString())}
              className="h-11 border-2 border-slate-900 bg-white hover:bg-slate-100 text-slate-900 font-mono text-base font-black rounded-none shadow-[2px_2px_0px_0px_#0F172A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-11 border-2 border-slate-900 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-bold rounded-none shadow-[2px_2px_0px_0px_#0F172A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
          >
            مسح
          </button>
          <button
            type="button"
            onClick={() => handleDigitClick('0')}
            className="h-11 border-2 border-slate-900 bg-white hover:bg-slate-100 text-slate-900 font-mono text-base font-black rounded-none shadow-[2px_2px_0px_0px_#0F172A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-11 border-2 border-slate-900 bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-800 text-xs font-bold rounded-none shadow-[2px_2px_0px_0px_#0F172A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
          >
            ⌫
          </button>
        </div>

        {/* Enter Button - Sharp Brutalist Style */}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-2.5 border-2 border-slate-900 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-none shadow-[3px_3px_0px_0px_#0F172A] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Unlock className="w-3.5 h-3.5" />
          <span>فتح الخزنة التنفيذية</span>
        </button>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono font-bold">
          <span>تشفير جلسة محلي ✓</span>
          <span>الرمز: 7799</span>
        </div>
      </div>
    </div>
  );
}
