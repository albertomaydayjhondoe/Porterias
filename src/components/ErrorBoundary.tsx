import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: "20px",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
          maxWidth: "600px",
          margin: "50px auto"
        }}>
          <h1 style={{ color: "#e74c3c" }}>Algo salió mal</h1>
          <p>Ha ocurrido un error inesperado en la aplicación.</p>
          <details style={{ 
            textAlign: "left", 
            backgroundColor: "#f8f9fa", 
            padding: "10px", 
            borderRadius: "4px",
            marginTop: "20px" 
          }}>
            <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
              Ver detalles técnicos
            </summary>
            <pre style={{ 
              overflow: "auto", 
              fontSize: "12px",
              marginTop: "10px",
              whiteSpace: "pre-wrap"
            }}>
              {this.state.error?.toString()}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;