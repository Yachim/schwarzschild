function nthOddRoot(x: number, n: number) {
  return Math.sign(x) * Math.abs(x) ** (1 / n)
}

export function getCircularOrbitPhiVelocity(r: number) {
  return Math.sqrt(r - 3) / (r * (r - 3))
}

export function getCircularGeostationaryOrbitR(t: number) {
  const d = - (t ** 2) / (4 * Math.PI ** 2)

  const rho = nthOddRoot((d - 2 - Math.sqrt(d ** 2 - 4 * d)) / 2, 3)

  return 1 - rho - 1 / rho
}

export function getCircularGeostationaryOrbitPhiVelocity(t: number) {
  return Math.PI * 2 / t
}

export function getEscapeVelocity(r: number) {
  return Math.sqrt(2 / r)
}
