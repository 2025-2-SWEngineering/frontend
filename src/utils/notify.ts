export function notifyInfo(message: string) {
  window.alert(message);
}

export function notifyError(message: string) {
  window.alert(message);
}

export function notifySuccess(message: string) {
  window.alert(message);
}

export async function confirmAsync(message: string): Promise<boolean> {
  return Promise.resolve(window.confirm(message));
}
