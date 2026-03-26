"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-950/50 border border-red-900 rounded-xl m-8 text-red-200">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <pre className="whitespace-pre-wrap text-sm font-mono bg-black/50 p-4 rounded">
            {this.state.error?.message}
          </pre>
          <button
            className="mt-4 px-4 py-2 bg-red-900 hover:bg-red-800 rounded text-white"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
