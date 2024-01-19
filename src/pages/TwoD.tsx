import { useCallback, useEffect, useMemo, useState } from "react";
import Canvas from "../components/Canvas";
import { drawArrow } from "../utils/canvasUtils";
import { geodesicStep, getTimeVelocity } from "../utils/geodesics";
import { timeConversionFactor, useFrequency, useLength, useSolarMass, useTime, useVelocity } from "../utils/units";
import { BlockMath, InlineMath } from 'react-katex'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import { faStop } from "@fortawesome/free-solid-svg-icons/faStop";
import { getCircularOrbitVelocity } from "../utils/trajectoryUtils";

const coordsColor = "#bfbaba"
const rUnit = 75
const bhColor = "#000000"
const arrowColor = "#00ff00"
const rotationPeriod = 3
const spinning = false
const planetColor = "#0000ff"

export default function TwoD() {
  const [playState, setPlayState] = useState<"playing" | "paused" | "stopped">("stopped")
  const {
    si: siMass,
    solar: solarMass,
    setSolar: setSolarMass,
  } = useSolarMass(10)
  const [frequency, setFrequency] = useState(30)
  const [timeScale, setTimeScale] = useState(1)
  const interval = useMemo(() => 1 / frequency, [frequency])
  const timeStep = useMemo(() => interval / timeConversionFactor(siMass), [interval, siMass])

  const [properTime, setProperTime] = useState(0)

  const {
    si: siT,
    geo: geoT,
    setGeo: setGeoT,
  } = useTime(0, siMass)
  const {
    si: siR,
    setSi: setSiR,
    geo: geoR,
    setGeo: setGeoR,
  } = useLength(59085.5, siMass)
  const [phi, setPhi] = useState(0)

  const {
    si: siRVel,
    setSi: setSiRVel,
    geo: geoRVel,
    setGeo: setGeoRVel,
  } = useVelocity(0)
  const {
    si: siPhiVel,
    setSi: setSiPhiVel,
    geo: geoPhiVel,
    setGeo: setGeoPhiVel,
  } = useFrequency(0, siMass)
  const [tVel, setTVel] = useState(getTimeVelocity(geoR, [geoRVel, geoPhiVel]))
  useEffect(() => {
    setTVel(getTimeVelocity(geoR, [geoRVel, geoPhiVel]))
  }, [geoR, geoRVel, geoPhiVel])

  const [initialGeoR, setInitialGeoR] = useState(0)
  const [initialPhi, setInitialPhi] = useState(0)
  const [initialTVel, setInitialTVel] = useState(0)
  const [initialGeoRVel, setInitialGeoRVel] = useState(0)
  const [initialGeoPhiVel, setInitialGeoPhiVel] = useState(0)

  useEffect(() => {
    if (playState !== "stopped") return

    setInitialGeoR(geoR)
    setInitialPhi(phi)
    setInitialTVel(tVel)
    setInitialGeoRVel(geoRVel)
    setInitialGeoPhiVel(geoPhiVel)
  }, [geoT, geoR, phi, tVel, geoRVel, geoPhiVel, playState])

  useEffect(() => {
    if (playState !== "playing") return
    const i = setInterval(() => {
      setProperTime(prev => prev + interval * timeScale)
      const [
        [newGeoT, newGeoR, newPhi],
        [newTVel, newGeoRVel, newGeoPhiVel]
      ] = geodesicStep([geoT, geoR, phi], [tVel, geoRVel, geoPhiVel], timeStep * timeScale)

      setGeoT(newGeoT)
      setGeoR(newGeoR)
      setPhi(newPhi)

      setTVel(newTVel)
      setGeoRVel(newGeoRVel)
      setGeoPhiVel(newGeoPhiVel)
    }, interval * 1000)

    return () => clearInterval(i)
  }, [
    geoT,
    setGeoT,
    geoR,
    setGeoR,
    phi,
    setPhi,

    tVel,
    setTVel,
    geoRVel,
    setGeoRVel,
    geoPhiVel,
    setGeoPhiVel,

    interval,
    timeStep,
    playState,
    timeScale,
  ])

  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
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
      //drawArrow(ctx, centerX, centerY, rUnit, 10, 2 * Math.PI * t / rotationPeriod)
      ctx.closePath()
    }

    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.fillStyle = planetColor
    // dividing by 2 because rs = 2M and unit = rs
    // subtracting y because the origin is at the top
    ctx.arc(centerX + geoR / 2 * rUnit * Math.cos(phi), centerY - geoR / 2 * rUnit * Math.sin(phi), 20, 0, 2 * Math.PI)
    ctx.fill()
    ctx.closePath()
  }, [geoR, phi])

  return (
    <div>
      <div className="absolute top-4 right-4 flex gap-2">
        <button onClick={() => setPlayState(prev => prev === "playing" ? "paused" : "playing")}><FontAwesomeIcon icon={playState !== "playing" ? faPlay : faPause} /></button>
        <button onClick={() => {
          setPlayState("stopped")
          setProperTime(0)
          setGeoT(0)
          setGeoR(initialGeoR)
          setPhi(initialPhi)
          setTVel(initialTVel)
          setGeoRVel(initialGeoRVel)
          setGeoPhiVel(initialGeoPhiVel)
        }}><FontAwesomeIcon icon={faStop} /></button>
        <label className="flex gap-2">
          Time scale:
          <input value={timeScale} onChange={e => setTimeScale(+e.target.value)} />
        </label>
        <label className="flex gap-2">
          <input type="number" min="30" max="200" value={frequency} onChange={e => setFrequency(+e.target.value)} />
          <InlineMath math={String.raw`Hz`} />
        </label>
      </div>
      <div className="absolute top-12 right-4 flex flex-col">
        <BlockMath math={String.raw`\begin{gather*}
          \begin{aligned}
          t &= ${siT}\ s & \frac{dt}{d\lambda} &= ${tVel} \\[1ex]
          r &= ${siR}\ m & \frac{dr}{d\lambda} &= ${siRVel}\ m\,s^{-1} \\[1ex]
          \phi &= ${phi} & \frac{d\phi}{d\lambda} &= ${siPhiVel}\ s^{-1} \\[1ex]
          \end{aligned} \\
          \lambda = ${properTime}\ s
        \end{gather*}`} />
      </div>
      <div className="absolute bottom-4 right-4 flex flex-col">
        <label>
          <input value={solarMass} onChange={e => setSolarMass(+e.target.value)} />
          <InlineMath math={String.raw`M_{\odot}`} />
        </label>

        <label className="flex gap-2">
          <InlineMath math={String.raw`r_0`} />
          <input value={siR} onChange={e => setSiR(+e.target.value)} />
          <InlineMath math={String.raw`m`} />
        </label>
        <label className="flex gap-2">
          <InlineMath math={String.raw`\phi_0`} />
          <input value={phi} onChange={e => setPhi(+e.target.value)} />
        </label>

        <label className="flex gap-2">
          <InlineMath math={String.raw`\left.\frac{dr}{d\lambda}\right|_0`} />
          <input value={siRVel} onChange={e => setSiRVel(+e.target.value)} />
          <InlineMath math={String.raw`m\,s^{-1}`} />
        </label>
        <label className="flex gap-2">
          <InlineMath math={String.raw`\left.\frac{d\phi}{d\lambda}\right|_0`} />
          <input value={siPhiVel} onChange={e => setSiPhiVel(+e.target.value)} />
          <InlineMath math={String.raw`s^{-1}`} />
          <button onClick={() => setGeoPhiVel(getCircularOrbitVelocity(geoR))}>Set to orbital velocity</button>
        </label>
      </div>
      <Canvas draw={draw} />
    </div >
  )
}
