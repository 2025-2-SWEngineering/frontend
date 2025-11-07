import React from "react";

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: unknown | null;
};

export function useAsync<T>(
  fn: () => Promise<T>,
  deps: React.DependencyList = [],
  options?: { immediate?: boolean },
) {
  const [state, setState] = React.useState<AsyncState<T>>({
    data: null,
    loading: !!options?.immediate,
    error: null,
  });

  const run = React.useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fn();
      setState({ data: res, loading: false, error: null });
      return res;
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e }));
      throw e;
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (options?.immediate) {
      run();
    }
  }, [run, options?.immediate]);

  return { ...state, run } as const;
}
