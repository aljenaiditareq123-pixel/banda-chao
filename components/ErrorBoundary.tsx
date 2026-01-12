'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Detailed error logging
    console.error('========================================');
    console.error('🚨 ErrorBoundary caught an error!');
    console.error('========================================');
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    console.error('Error Name:', error.name);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('========================================');
    
    // Also log to console with full error object
    console.error('Full Error Object:', error);
    console.error('Full Error Info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Internal Server Error</h1>
            <p className="text-gray-600 mb-2 font-semibold">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            {this.state.error?.stack && (
              <details className="text-left mt-4 mb-4">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Show Error Details
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-48">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              返回首页
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}


