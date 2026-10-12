import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.error('UI error boundary caught:', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-canvas p-6">
          <div className="card max-w-md w-full text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4m0 4h.01" />
                <path d="M10.3 3.86l-8.5 14.7A2 2 0 003.5 22h17a2 2 0 001.7-3.44l-8.5-14.7a2 2 0 00-3.4 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-ink mb-1.5">Something went wrong</h2>
            <p className="text-sm text-ink-muted mb-5">
              The page crashed unexpectedly. Refresh to continue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-brand-gradient text-white text-sm font-semibold shadow-glow"
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
