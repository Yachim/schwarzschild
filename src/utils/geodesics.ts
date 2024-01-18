type Vec = [number, number, number]

export function geodesicStep([t, r, phi]: Vec, [tVel, rVel, phiVel]: Vec, timeStep: number): [Vec, Vec] {
  const newTVel = tVel - 2 / (r * (r - 2)) * tVel * rVel * timeStep
  const newRVel = rVel - ((r - 2) / r ** 3 * tVel ** 2 + 1 / (r * (r - 2)) * rVel ** 2 + (r - 2) * phiVel ** 2) * timeStep
  const newPhiVel = phiVel - 2 / r * rVel * phiVel * timeStep
  const newT = t + tVel * timeStep
  const newR = r + rVel * timeStep
  const newPhi = phi + phiVel * timeStep

  return [
    [newT, newR, newPhi],
    [newTVel, newRVel, newPhiVel],
  ]
}

export function timeVelocity(r: number, [rVel, phiVel]: [number, number]) {
  return Math.sqrt((1 + r / (r - 2) * rVel ** 2 + r ** 2 * phiVel ** 2) * r / (r - 2))
}
