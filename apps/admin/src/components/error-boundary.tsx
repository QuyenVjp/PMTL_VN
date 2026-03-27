/**
 * Error Boundary — catches React render errors gracefully
 *
 * Constitution: FRONTEND_ARCHITECTURE.md requires error boundaries
 * for resilient UX. Elderly users should never see a white screen.
 */
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangleIcon className="size-6 text-destructive" />
              </div>
              <CardTitle className="text-lg">Đã xảy ra lỗi</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4 text-sm text-muted-foreground">
                {this.state.error?.message ?? "Lỗi không xác định. Vui lòng thử lại."}
              </p>
              <Button
                onClick={this.handleReset}
                variant="outline"
                className="min-h-[44px] gap-2"
              >
                <RefreshCwIcon className="size-4" />
                Thử lại
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
