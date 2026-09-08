import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class BIErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('BI Uncaught Exception:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070F1E] flex flex-col items-center justify-center p-6 text-white text-center font-sans" dir="rtl">
          <div className="max-w-md w-full bg-[#0D1E36] border border-rose-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">حدث خطأ غير متوقع في المنصة</h2>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                {this.state.error?.message || 'تعذر تحميل الواجهة بشكل صحيح.'}
              </p>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة تحميل الصفحة</span>
              </button>

              <button
                onClick={() => {
                  window.location.hash = '#/login';
                  window.location.reload();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 transition-all border border-white/10"
              >
                <Home className="w-3.5 h-3.5" />
                <span>شاشة الدخول</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
