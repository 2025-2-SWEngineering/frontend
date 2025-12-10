type Listener = (count: number) => void;

let pendingCount = 0;
let listeners: Listener[] = [];

// Debug: keep recent stacks for increments to help find unmatched calls
const recentIncrementStacks: string[] = [];

export function getRecentIncrementStacks() {
  return recentIncrementStacks.slice();
}

// Expose debug helpers on window for easy inspection in browser/devtools
try {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.__getLoadingCount = getLoadingCount;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.__getRecentLoadingStacks = getRecentIncrementStacks;
  }
} catch {
  // ignore in non-browser contexts
}

function emit() {
  for (const fn of listeners) fn(pendingCount);
}

export function incrementLoading() {
  pendingCount += 1;
  try {
    const stack = new Error().stack || "";
    recentIncrementStacks.push(`${new Date().toISOString()}\n${stack}`);
    if (recentIncrementStacks.length > 20) recentIncrementStacks.shift();
    // helpful quick log for debugging stuck loader
    // eslint-disable-next-line no-console
    console.debug("[loading] increment ->", pendingCount);
  } catch {
    // ignore
  }
  emit();
}

export function decrementLoading() {
  pendingCount = Math.max(0, pendingCount - 1);
  try {
    // eslint-disable-next-line no-console
    console.debug("[loading] decrement ->", pendingCount);
  } catch {
    // ignore
  }
  emit();
}

export function subscribeLoading(fn: Listener) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function getLoadingCount() {
  return pendingCount;
}
