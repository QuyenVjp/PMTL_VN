type Scope = {
  setExtra: (_key: string, _value: unknown) => void;
  setTag: (_key: string, _value: string) => void;
};

type SeverityLevel = "fatal" | "error" | "warning" | "log" | "info" | "debug";

const noop = () => {};

export function init(): void {}

export function captureException(_error: unknown, _context?: unknown): string {
  return "sentry-disabled";
}

export function captureMessage(_message: string, _level?: SeverityLevel): string {
  return "sentry-disabled";
}

export function captureRequestError(..._args: unknown[]): void {}

export function captureRouterTransitionStart(..._args: unknown[]): void {}

export function withScope(callback: (scope: Scope) => void): void {
  callback({
    setExtra: noop,
    setTag: noop,
  });
}

export async function close(_timeout?: number): Promise<boolean> {
  return true;
}

export async function flush(_timeout?: number): Promise<boolean> {
  return true;
}
