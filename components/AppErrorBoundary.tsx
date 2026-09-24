import React, { Component } from 'react';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Falha inesperada no Studio Black7:', error, info);
  }

  private goHome = () => {
    window.location.href = import.meta.env.BASE_URL;
  };

  private reload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-[#08080a] text-zinc-100 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-amber-400/30 bg-zinc-900 p-7 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/10 text-2xl font-black text-amber-400">
            7
          </div>
          <h1 className="font-['Cinzel'] text-2xl font-black text-white">Studio Black7</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Esta tela encontrou uma falha inesperada. Seus dados não foram apagados.
          </p>
          <div className="mt-6 grid gap-3">
            <button
              type="button"
              onClick={this.reload}
              className="w-full rounded-xl bg-amber-400 px-4 py-3 text-xs font-black uppercase tracking-wider text-zinc-950"
            >
              Tentar novamente
            </button>
            <button
              type="button"
              onClick={this.goHome}
              className="w-full rounded-xl border border-zinc-700 bg-black/30 px-4 py-3 text-xs font-bold uppercase tracking-wider text-zinc-200"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    );
  }
}
