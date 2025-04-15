
interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render shows the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 bg-red-900 bg-opacity-80 text-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="mb-2">The application encountered an error.</p>
          <details className="mt-2 text-sm bg-red-950 p-2 rounded">
            <summary className="cursor-pointer">Error details</summary>
            <p className="mt-1 font-mono whitespace-pre-wrap text-red-200">
              {this.state.error?.toString()}
            </p>
          </details>
          <button
            className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded transition"
            onClick={() => window.location.reload()}
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;