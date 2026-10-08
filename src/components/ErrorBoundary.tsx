import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Sparkles, BookOpen, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Wilting of Words Critical Error]:', error, errorInfo);
  }

  private handleReload = () => {
    // Unregister service workers and clear caches on critical reload if requested
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => reg.unregister());
      }).catch(() => {});
    }
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      }).catch(() => {});
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#120805] text-[#FAF7F2] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#1C0E09] border border-[#8B2213] rounded-3xl p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto shadow-lg">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[10px] font-cinzel font-bold text-[#FFE58F] tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Sanctuary Recovery System</span>
              </div>
              <h2 className="font-cinzel text-xl font-bold text-[#FFE58F]">
                Wilting of Words
              </h2>
              <p className="text-xs text-stone-300 leading-relaxed font-sans">
                The literary sanctuary encountered a temporary display issue. Tap below to refresh and restore the application instantly.
              </p>
            </div>

            <button
              onClick={this.handleReload}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#B93826] to-[#8B2213] hover:from-[#A02D1D] hover:to-[#731A0D] text-white font-cinzel font-bold text-xs tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              <span>Reload Sanctuary App</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
