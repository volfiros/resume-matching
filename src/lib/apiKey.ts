const KEY = "sift-gemini-key";
const EXPIRY_KEY = "sift-gemini-expiry";
const TTL = 7 * 24 * 60 * 60 * 1000;

export function saveApiKey(value: string): void {
  localStorage.setItem(KEY, value);
  localStorage.setItem(EXPIRY_KEY, String(Date.now() + TTL));
}

export function loadApiKey(): string {
  const expiry = Number(localStorage.getItem(EXPIRY_KEY) ?? 0);
  if (!expiry || Date.now() > expiry) {
    localStorage.removeItem(KEY);
    localStorage.removeItem(EXPIRY_KEY);
    return "";
  }
  return localStorage.getItem(KEY) ?? "";
}

export function clearApiKey(): void {
  localStorage.removeItem(KEY);
  localStorage.removeItem(EXPIRY_KEY);
}
