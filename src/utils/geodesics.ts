import { clamp } from "./generalUtils"

type Vec = [number, number, number]

export function geodesicStep([t, r, phi]: Vec, [tVel, rVel, phiVel]: Vec, timeStep: number, clampR: boolean): [Vec, Vec] {
  if (clampR && Math.abs(r - 2) < 0.1) {
    return [
      [t, r, phi],
      [tVel, rVel, phiVel],
    ]
  }

  const tAcc = - 2 / (r * (r - 2)) * tVel * rVel
  const rAcc = - ((r - 2) / (r ** 3) * (tVel ** 2) - 1 / (r * (r - 2)) * (rVel ** 2) - (r - 2) * (phiVel ** 2))
  const phiAcc = - 2 / r * rVel * phiVel

  const newTVel = tVel + tAcc * timeStep
  const newRVel = rVel + rAcc * timeStep
  const newPhiVel = phiVel + phiAcc * timeStep
  const newT = t + tVel * timeStep
  let newR = r + rVel * timeStep
  if (clampR) {
    newR = clamp(2, Infinity, newR)
  }
  const newPhi = phi + phiVel * timeStep

  return [
    [newT, newR, newPhi],
    [newTVel, newRVel, newPhiVel],
  ]
}

export function getTimeVelocity(r: number, [rVel, phiVel]: [number, number]) {
  return Math.sqrt((1 + r / (r - 2) * rVel ** 2 + r ** 2 * phiVel ** 2) * r / (r - 2))
}
