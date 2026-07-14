/**
 * Admin unit-test setup.
 * Enables React's act() environment so state updates from react-query
 * flush deterministically under createRoot + act().
 */
import { afterEach } from "vitest";

// Signal to React that we are in a test act() environment.
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  // Only DOM-env files have a document; schema tests run under // @vitest-environment node.
  if (typeof document !== "undefined") {
    document.body.innerHTML = "";
  }
});
