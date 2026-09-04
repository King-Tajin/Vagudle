import { Component, type ErrorInfo, type ReactNode } from "react";
import { recordException } from "../lib/crashReporting";
import strings from "../constants/strings";

type CrashBoundaryProps = {
  children: ReactNode;
};

type CrashBoundaryState = {
  hasError: boolean;
};

export class CrashBoundary extends Component<
  CrashBoundaryProps,
  CrashBoundaryState
> {
  state: CrashBoundaryState = { hasError: false };

  static getDerivedStateFromError(): CrashBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    void recordException(error);
    if (info.componentStack) {
      void recordException(
        new Error(`Component stack: ${info.componentStack}`)
      );
    }
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100dvh",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
            color: "white",
            background: "black",
          }}
        >
          <p>{strings.CRASH_BOUNDARY_MESSAGE_TEXT}</p>
          <button onClick={this.handleReload}>
            {strings.CRASH_BOUNDARY_RELOAD_BUTTON_TEXT}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
