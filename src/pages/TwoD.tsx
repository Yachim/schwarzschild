import { useCallback } from "react";
import Canvas from "../components/Canvas";
import { drawArrow } from "../utils/canvasUtils";
import { geodesicStep, timeVelocity } from "../utils/geodesics";
import { Vec } from "../utils/numericalDEs";
import { gravityConstant, lightSpeed } from "../utils/constants";

const coordsColor = "#bfbaba"
const rUnit = 75
const bhColor = "#000000"
const arrowColor = "#00ff00"
const rotationPeriod = 3
const spinning = false
const planetColor = "#0000ff"

const planetTFreeFall = 0
const planetRFreeFall = 4
const planetPhiFreeFall = 0

const planetRVelFreeFall = 0
const planetPhiVelFreeFall = 0
const planetTVelFreeFall = timeVelocity([planetRFreeFall, planetPhiFreeFall], [planetRVelFreeFall, planetPhiVelFreeFall])

type State = {
  coords: Vec
  velocities: Vec
}

const initialStateFreeFall: State = {
  coords: [planetTFreeFall, planetRFreeFall, planetPhiFreeFall],
  velocities: [planetTVelFreeFall, planetRVelFreeFall, planetPhiVelFreeFall],
}

const planetTOrbit = 0
const planetROrbit = 4
const planetPhiOrbit = 0

const planetRVelOrbit = 0
const planetPhiVelOrbit = Math.sqrt(planetROrbit - 3) / (planetROrbit * (planetROrbit - 3))
const planetTVelOrbit = timeVelocity([planetROrbit, planetPhiOrbit], [planetRVelOrbit, planetPhiVelOrbit])

const initialStateOrbit: State = {
  coords: [planetTOrbit, planetROrbit, planetPhiOrbit],
  velocities: [planetTVelOrbit, planetRVelOrbit, planetPhiVelOrbit]
}

const initialState = initialStateFreeFall

export default function TwoD() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, t: number, dt: number, {
    coords,
    velocities,
  }: State) => {
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const diag = Math.sqrt(width ** 2 + height ** 2)

    // coordinates
    ctx.strokeStyle = coordsColor
    ctx.lineWidth = 1
    const rCnt = Math.ceil(diag / 2 / rUnit)
    for (let i = 1; i <= rCnt; i++) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, rUnit * i, 0, Math.PI * 2)
      ctx.stroke()
      ctx.closePath()
    }

    for (let i = 0; i < 13; i++) {
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(centerX + 1000 * Math.cos(i * 2 * Math.PI / 12), centerY + 1000 * Math.sin(i * 2 * Math.PI / 12))
      ctx.stroke()
      ctx.closePath()
    }
    // end of coordinates

    // black hole
    ctx.beginPath()
    ctx.strokeStyle = bhColor
    ctx.fillStyle = bhColor
    ctx.arc(centerX, centerY, rUnit, 0, Math.PI * 2)
    ctx.fill()
    ctx.closePath()


    if (spinning) {
      ctx.beginPath()
      ctx.lineWidth = 2
      ctx.strokeStyle = arrowColor
      drawArrow(ctx, centerX, centerY, rUnit, 10, 2 * Math.PI * t / rotationPeriod)
      ctx.closePath()
    }

    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.fillStyle = planetColor
    ctx.arc(centerX + coords[1] * rUnit * Math.cos(coords[2]), centerY + coords[1] * rUnit * Math.sin(coords[2]), 20, 0, 2 * Math.PI)
    ctx.fill()
    ctx.closePath()

    const [newVelocities, newCoords] = geodesicStep(coords, velocities, dt / (lightSpeed ** 3 * 1 * gravityConstant) * 5e4)

    return {
      coords: newCoords,
      velocities: newVelocities,
    }
  }, [])

  return <Canvas draw={draw} initialState={initialState} />
}
