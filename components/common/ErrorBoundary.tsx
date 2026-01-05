'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { captureException } from '@/lib/safeSentry';
import { maintenanceLogger } from '@/lib/maintenance-logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
  isRecovering: boolean;
}

/**
 * The Safety Net: Global Error Boundary
 * Catches React errors and attempts automatic recovery
 */
export class ErrorBoundary extends Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      isRecovering: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      retryCount: 0,
      isRecovering: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Send to Sentry (if available)
    captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        errorBoundary: true,
        retryCount: this.state.retryCount,
      },
    });

    // Log error to maintenance system
    maintenanceLogger.log('react_error_boundary', {
      message: error.message,
      componentStack: errorInfo.componentStack,
      retryCount: this.state.retryCount,
    }, 'error');

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    if (this.state.retryCount >= this.maxRetries) {
      maintenanceLogger.log('error_boundary_max_retries', {
        message: 'Maximum retry attempts reached',
        retryCount: this.state.retryCount,
      }, 'error');
      return;
    }

    this.setState(prevState => ({
      isRecovering: true,
      retryCount: prevState.retryCount + 1,
    }));

    maintenanceLogger.log('error_boundary_retry', {
      message: `Attempting to recover from error (Attempt ${this.state.retryCount + 1}/${this.maxRetries})`,
      error: this.state.error?.message,
    }, 'info');

    // Clear error state after a short delay
    this.retryTimeout = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        isRecovering: false,
      });

      maintenanceLogger.log('error_boundary_recovered', {
        message: 'Error boundary recovered successfully',
        retryCount: this.state.retryCount,
      }, 'info');
    }, 1000);
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.state.isRecovering) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {this.props.children?.toString().includes('ar') ? 'جاري إعادة الاتصال...' : 'Trying to reconnect...'}
              </h2>
              <p className="text-gray-600">
                {this.props.children?.toString().includes('ar') 
                  ? 'نحاول إصلاح المشكلة تلقائياً...' 
                  : 'The Maintenance Team is fixing this automatically...'}
              </p>
            </div>
          </div>
        );
      }

      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI - ALWAYS show error details for debugging
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-4xl w-full bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🔧</div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {this.props.children?.toString().includes('ar') ? 'حدث خطأ' : 'Something went wrong'}
              </h1>
            </div>
            
            {/* ALWAYS show error details in RED for debugging */}
            {this.state.error && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-red-600 mb-3">Error Details:</h2>
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-mono text-sm mb-2 break-words">
                    <strong>Message:</strong> {this.state.error.message || 'No error message'}
                  </p>
                  {this.state.error.stack && (
                    <pre className="text-red-700 text-xs mt-3 overflow-auto max-h-96 bg-red-100 p-3 rounded border border-red-300">
                      {this.state.error.stack}
                    </pre>
                  )}
                  {!this.state.error.stack && (
                    <p className="text-red-600 text-xs mt-2 italic">No stack trace available</p>
                  )}
                </div>
              </div>
            )}
            
            <div className="text-center">
              {this.state.retryCount < this.maxRetries && (
                <button
                  onClick={this.handleRetry}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {this.props.children?.toString().includes('ar') ? 'إعادة المحاولة' : 'Retry'}
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}



