
import React, { Component, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AuthErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.warn('Auth error boundary caught error:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('Auth error details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Silently redirect to home on any auth-related error
      return <Navigate to="/" replace />;
    }

    return this.props.children;
  }
}
