export function clamp(min: number, max: number, n: number) {
  return Math.min(Math.max(n, min), max)
}
