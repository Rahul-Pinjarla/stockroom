import { useEffect, useState, type DependencyList } from 'react';

type State<T> =
  | { status: 'loading'; data?: T }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error; data?: T };

/** Runs a request whenever deps change. Aborts the previous request so stale responses never win. */
export function useApi<T>(load: (signal: AbortSignal) => Promise<T>, deps: DependencyList): State<T> {
  const [state, setState] = useState<State<T>>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ status: 'loading', data: prev.data }));
    load(controller.signal)
      .then((data) => setState({ status: 'success', data }))
      .catch((error: Error) => {
        if (controller.signal.aborted) return;
        setState((prev) => ({ status: 'error', error, data: prev.data }));
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
