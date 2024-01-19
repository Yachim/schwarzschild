export function getCircularOrbitPhiVelocity(r: number) {
  return Math.sqrt(r - 3) / (r * (r - 3))
}

export function getCircularGeostationaryOrbitR(t: number) {
  const piSquared = Math.PI ** 2
  const piTo2Over3 = Math.PI ** (2 / 3)
  const tSquared = t ** 2

  const a = (8 * piSquared + tSquared + t * Math.sqrt(16 * piSquared + tSquared)) ** (1 / 3)
  const b = 2 * piTo2Over3

  return 1 + a / b + b / a
}

export function getCircularGeostationaryOrbitPhiVelocity(t: number) {
  return Math.PI * 2 / t
}
