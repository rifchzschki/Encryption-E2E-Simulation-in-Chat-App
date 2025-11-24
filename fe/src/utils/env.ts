export function getEnv(key: string, fallback?: string): string {
  const value = import.meta.env[key];

  if (!value && fallback === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value || fallback!;
}