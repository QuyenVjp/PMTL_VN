import * as React from "react";
import {
  createTable,
  type RowData,
  type TableOptions,
  type TableOptionsResolved,
  type Updater,
} from "@tanstack/react-table";

/**
 * Wraps TanStack useReactTable to avoid React warning:
 * "Can't perform a React state update on a component that hasn't mounted yet"
 * when table state change is emitted during initial render/unmount transitions.
 */
export function useSafeReactTable<TData extends RowData>(options: TableOptions<TData>) {
  const resolvedOptions: TableOptionsResolved<TData> = {
    state: {},
    onStateChange: () => undefined,
    renderFallbackValue: null,
    ...options,
  };

  const [tableRef] = React.useState(() => ({
    current: createTable<TData>(resolvedOptions),
  }));
  const [state, setState] = React.useState(() => tableRef.current.initialState);
  const mountedRef = React.useRef(false);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  tableRef.current.setOptions((prev) => ({
    ...prev,
    ...options,
    state: {
      ...state,
      ...options.state,
    },
    onStateChange: (updater: Updater<typeof state>) => {
      if (mountedRef.current) {
        setState(updater);
        options.onStateChange?.(updater);
      }
    },
  }));

  return tableRef.current;
}
