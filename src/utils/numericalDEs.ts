// theta = pi/2 = constant => the coordinate system needs to be rotated in 3d
// vectors are [t, r, phi]
export type Vec = [number, number, number]
type Func = (coords: Vec, velocities: Vec) => number
type Funcs = [Func, Func, Func]

export function euler(fs: Funcs, values: Vec, coords: Vec, velocities: Vec, timeStep: number): Vec {
  return fs.map((f, i) =>
    values[i] + f(coords, velocities) * timeStep
  )
}

// ?
export function rk4(fs: Funcs, values: Vec, coords: Vec, velocities: Vec, timeStep: number): Vec {
  return fs.map((f, i) => {
    const k1 = f(coords, velocities)
    const k2 = f(coords, velocities)
    return NaN
  })
}
