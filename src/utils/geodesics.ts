import { Vec, euler } from "./numericalDEs"

function d2t([_t, r, _phi]: Vec, [tVel, rVel, _phiVel]: Vec) {
  return - 2 / (r * (r - 2)) * tVel * rVel
}

function dt([_t, _r, _phi]: Vec, [tVel, _rVel, _phiVel]: Vec) {
  return tVel
}

function d2r([_t, r, _phi]: Vec, [tVel, rVel, phiVel]: Vec) {
  return - (r - 2) / r ** 3 * tVel ** 2 + 1 / (r * (r - 2)) * rVel ** 2 + (r - 2) * phiVel ** 2
}

function dr([_t, _r, _phi]: Vec, [_tVel, rVel, _phiVel]: Vec) {
  return rVel
}

function d2phi([_t, r, _phi]: Vec, [_tVel, rVel, phiVel]: Vec) {
  return -2 / r * rVel * phiVel
}

function dphi([_t, _r, _phi]: Vec, [_tVel, _rVel, phiVel]: Vec) {
  return phiVel
}

export function geodesicStep(coords: Vec, velocities: Vec, timeStep: number): [Vec, Vec] {
  return [
    euler([d2t, d2r, d2phi], velocities, coords, velocities, timeStep),
    euler([dt, dr, dphi], coords, coords, velocities, timeStep)
  ]
}

export function timeVelocity([r, _phi]: [number, number], [rVel, phiVel]: [number, number]) {
  return Math.sqrt((1 + r / (r - 2) * rVel ** 2 + r ** 2 * phiVel ** 2) * r / (r - 2))
}
