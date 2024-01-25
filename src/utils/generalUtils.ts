//import Complex from "complex.js";

export function clamp(min: number, max: number, n: number) {
  return Math.min(Math.max(n, min), max)
}

export function clampAngle(n: number) {
  let angle = n % (2 * Math.PI);

  if (angle < 0) {
    angle += 2 * Math.PI;
  }

  return angle;
}
