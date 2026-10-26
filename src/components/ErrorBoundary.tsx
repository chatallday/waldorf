import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  constructor(props: Props) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Waldorf Path application error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#FBF6EC', color: '#41506A', fontFamily: 'system-ui, sans-serif',
          padding: '2rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>&#127794;</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            A gentle pause in the path
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#76829A', maxWidth: '28rem', lineHeight: 1.6 }}>
            Something went amiss while loading this page. Please refresh, or return to the beginning of the path.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              marginTop: '1.5rem', padding: '0.6rem 1.5rem',
              background: '#9DBCAB', color: 'white', border: 'none',
              borderRadius: '999px', fontSize: '0.9rem', fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Return to the Path
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '0.75rem', padding: '0.5rem 1.2rem',
              background: 'transparent', color: '#76829A', border: '1px solid rgba(65,80,106,0.14)',
              borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return (this as React.Component<Props, State>).props.children;
  }
}