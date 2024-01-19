export function getCircularOrbitVelocity(r: number) {
  return Math.sqrt(r - 3) / (r * (r - 3))
}
