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

//const xi = new Complex(-1).add(new Complex(-3).sqrt()).div(2)

// returns real roots
// https://en.wikipedia.org/wiki/Cubic_equation#General_cubic_formula
/*export function solveCubic(a_: number, b_: number, c_: number, d_: number): number[] {
  const a = new Complex(a_)
  const b = new Complex(b_)
  const c = new Complex(c_)
  const d = new Complex(d_)

  const delta0 = b.pow(2).sub(a.mul(c).mul(3))
  const delta1 = b.pow(2).mul(2).sub(a.mul(b).mul(c).mul(9)).sub(a.pow(2).mul(d).mul(27))
  const sqrt = delta1.pow(2).sub(delta0.pow(3).mul(4))

  const C1 = delta1.add(sqrt).div(2).pow(1 / 3)
  const C2 = delta1.sub(sqrt).div(2).pow(1 / 3)

  const C = C1.isZero() ? C2 : C1

  const xi0C = C.mul(xi.pow(0))
  const xi1C = C.mul(xi.pow(1))
  const xi2C = C.mul(xi.pow(2))

  const res = [
    new Complex(-1 / (3 * a_)).mul(b.add(xi0C).add(delta0.div(xi0C))),
    new Complex(-1 / (3 * a_)).mul(b.add(xi1C).add(delta0.div(xi1C))),
    new Complex(-1 / (3 * a_)).mul(b.add(xi2C).add(delta0.div(xi2C)))
  ]
  console.log(res)

  return res.filter(el => Math.abs(el.im) < 0.0001).map(el => el.re)
}*/

// returns real roots
// https://en.wikipedia.org/wiki/Cubic_equation#Cardano's_formula
export function solveCubic(a: number, b: number, c: number, d: number): number {
  const p = (3 * a * c - b ** 2) / (3 * a ** 2)
  const q = (2 * b ** 3 - 9 * a * b * c + 27 * a ** 2 * d) / (27 * a ** 3)
  const delta = q ** 2 / 4 + p ** 3 / 27
  const sqrtDelta = Math.sqrt(delta)
  const u1 = -q / 2 + sqrtDelta
  const u2 = -q / 2 - sqrtDelta

  const u1root3 = Math.sign(u1) * Math.abs(u1) ** (1 / 3)
  const u2root3 = Math.sign(u2) * Math.abs(u2) ** (1 / 3)

  if (4 * p ** 3 + 27 * q ** 2 < 0) {
    console.log("three real roots")
  }

  const root = u1root3 + u2root3
  return root - b / (3 * a)
}
