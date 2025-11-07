type Listener = (count: number) => void;

let pendingCount = 0;
let listeners: Listener[] = [];

function emit() {
  for (const fn of listeners) fn(pendingCount);
}

export function incrementLoading() {
  pendingCount += 1;
  emit();
}

export function decrementLoading() {
  pendingCount = Math.max(0, pendingCount - 1);
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
