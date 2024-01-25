import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Canvas from "../components/Canvas";
import { drawArrow } from "../utils/canvasUtils";
import { geodesicStep, getTimeVelocity } from "../utils/geodesics";
import { lengthConversionFactor, timeConversionFactor, useFrequency, useLength, useSolarMass, useTime, useVelocity } from "../utils/units";
import { BlockMath, InlineMath } from 'react-katex'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import { faStop } from "@fortawesome/free-solid-svg-icons/faStop";
import { getCircularGeostationaryOrbitPhiVelocity, getCircularGeostationaryOrbitR, getCircularOrbitPhiVelocity, getEscapeVelocity } from "../utils/trajectoryUtils";
import { debug } from "../utils/constants";
import { clampAngle } from "../utils/generalUtils";

const coordsColor = "#bfbaba"
const rUnit = 75
const scaleFactor = 2

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
  const timeStep = useMemo(() => interval / timeConversionFactor(siMass) * timeScale, [interval, siMass, timeScale])
  const [trailPoints, setTrailPoints] = useState<[number, number, number][]>([]) // [r, phi, time (for decay)]

  const [bhColor, setBhColor] = useState("#000000")
  const [arrowColor, setArrowColor] = useState("#00ff00")
  const [planetColor, setPlanetColor] = useState("#0000ff")
  const [planetTrailColor, setPlanetTrailColor] = useState("#0000f0")

  useEffect(() => {
    if (debug) {
      console.log("Geometrized time step: ", timeStep)
    }
  }, [timeStep])

  const [isBhSpinning, setIsBhSpinning] = useState(false)
  const { si: siBhRotationPeriod, setSi: setSiBhRotationPeriod, geo: geoBhRotationPeriod } = useTime(2, siMass)
  const siBhAngularVelocity = useMemo(() => 2 * Math.PI / siBhRotationPeriod, [siBhRotationPeriod])
  const [bhRotationArrowAngle, setBhRotationArrowAngle] = useState(0)

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
  } = useLength(295400, siMass)
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

  // TODO: for now, changing mass keeps scale in r_s constant
  // should it be constant for meters instead?
  const [scale, setScale] = useState(1)

  const [trailEnabled, setTrailEnabled] = useState(true)
  const [trailDecay, setTrailDecay] = useState(10) // 0 = doesnt decay

  useEffect(() => {
    if (playState !== "stopped") return

    setInitialGeoR(geoR)
    setInitialPhi(phi)
    setInitialTVel(tVel)
    setInitialGeoRVel(geoRVel)
    setInitialGeoPhiVel(geoPhiVel)
  }, [geoT, geoR, phi, tVel, geoRVel, geoPhiVel, playState])

  const [clampR, setClampR] = useState(true)

  useEffect(() => {
    const i = setInterval(() => {
      if (trailDecay > 0) {
        setTrailPoints(prev => [...prev.filter(([_r, _phi, t]) => Date.now() / 1000 - t < trailDecay)])
      }
    }, interval * 1000)

    return () => clearInterval(i)
  }, [trailDecay, interval])

  useEffect(() => {
    if (playState !== "playing") return
    const i = setInterval(() => {
      setProperTime(prev => prev + interval * timeScale)
      setBhRotationArrowAngle(prev => prev + siBhAngularVelocity * interval * timeScale)

      const [
        [newGeoT, newGeoR, newPhi],
        [newTVel, newGeoRVel, newGeoPhiVel]
      ] = geodesicStep([geoT, geoR, phi], [tVel, geoRVel, geoPhiVel], timeStep, clampR)

      if (trailEnabled) {
        setTrailPoints(prev => [...prev, [newGeoR, newPhi, Date.now() / 1000]])
      }

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

    siBhAngularVelocity,

    interval,
    timeStep,
    playState,
    timeScale,
    clampR,
    trailEnabled,
    trailDecay
  ])

  const {
    si: siBhRadius,
    setSi: setSiBhRadius,
    geo: geoBhRadius,
    setGeo: setGeoBhRadius
  } = useLength(29540, siMass)
  useEffect(() => {
    if (geoBhRadius < 2) setGeoBhRadius(2)
  }, [geoBhRadius, setGeoBhRadius])
  const {
    si: siPlanetRadius,
    setSi: setSiPlanetRadius,
    geo: geoPlanetRadius,
  } = useLength(10000, siMass)

  // dividing by 2 because rs = 2M and unit = rs
  // subtracting y because positive y goes down
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
    ctx.arc(centerX, centerY, geoBhRadius / 2 * scale * rUnit, 0, Math.PI * 2)
    ctx.fill()
    ctx.closePath()


    if (isBhSpinning) {
      ctx.beginPath()
      ctx.lineWidth = 2
      ctx.strokeStyle = arrowColor
      drawArrow(ctx, centerX, centerY, geoBhRadius / 2 * scale * rUnit, 10, bhRotationArrowAngle)
      ctx.closePath()
    }

    // orbiting planet
    ctx.beginPath()
    ctx.lineWidth = 1
    ctx.fillStyle = planetColor
    ctx.arc(
      centerX + scale * geoR / 2 * rUnit * Math.cos(phi),
      centerY - scale * geoR / 2 * rUnit * Math.sin(phi),
      geoPlanetRadius / 2 * scale * rUnit,
      0, 2 * Math.PI)
    ctx.fill()
    ctx.closePath()

    // trail
    if (trailEnabled) {
      ctx.beginPath()
      ctx.strokeStyle = planetTrailColor
      ctx.lineWidth = 2
      trailPoints.forEach(([r, phi, _t]) => {
        ctx.lineTo(
          centerX + scale * r / 2 * rUnit * Math.cos(phi),
          centerY - scale * r / 2 * rUnit * Math.sin(phi)
        )
      })
      ctx.stroke()
      ctx.closePath()
    }
  }, [
    geoR,
    phi,
    isBhSpinning,
    bhRotationArrowAngle,
    scale,
    geoBhRadius,
    geoPlanetRadius,
    trailPoints,
    trailEnabled,
    bhColor,
    planetColor,
    arrowColor,
    planetTrailColor,
  ])

  const elementRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = elementRef.current!

    function handleWheel(e: WheelEvent) {
      setScale(prev => prev * (scaleFactor ** -Math.sign(e.deltaY)))
    }

    element.addEventListener("wheel", handleWheel)

    return () => element.removeEventListener("wheel", handleWheel)
  }, [elementRef])

  const [openedMenu, setOpenedMenu] = useState<"style" | "mechanics">("style")

  const [scaleChanged, setScaleChanged] = useState(false)

  const isMounting = useRef(false) // to prevent flash on render
  useEffect(() => {
    isMounting.current = true
  }, [])

  useEffect(() => {
    if (isMounting.current) {
      isMounting.current = false
      return
    }
    setScaleChanged(true)
    const t = setTimeout(() => setScaleChanged(false), 1000)
    return () => clearTimeout(t)
  }, [siMass])

  return (
    <div>
      <div className="absolute p-4 flex flex-col gap-4 bg-gray-100 bg-opacity-75 rounded-br-xl">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button onClick={() => {
              if (playState === "stopped" && trailEnabled) {
                setTrailPoints([[geoR, phi, Date.now() / 1000]])
              }
              setPlayState(prev => prev === "playing" ? "paused" : "playing")
            }}><FontAwesomeIcon icon={playState !== "playing" ? faPlay : faPause} /></button>
            <button onClick={() => {
              setPlayState("stopped")
              setTrailPoints([])
              setBhRotationArrowAngle(0)
              setProperTime(0)
              setGeoT(0)
              setGeoR(initialGeoR)
              setPhi(initialPhi)
              setTVel(initialTVel)
              setGeoRVel(initialGeoRVel)
              setGeoPhiVel(initialGeoPhiVel)
            }}><FontAwesomeIcon icon={faStop} /></button>
          </div>
          <label className="flex gap-2">
            <input value={timeScale} onChange={e => setTimeScale(+e.target.value)} />
            x
          </label>
          <label className="flex gap-2">
            <input type="number" min="30" max="200" value={frequency} onChange={e => setFrequency(+e.target.value)} />
            <InlineMath math={String.raw`Hz`} />
          </label>
        </div>

        {playState === "stopped" &&
          <>
            <hr className="text-black" />
            <span className="flex gap-4">
              <button className={openedMenu === "style" ? "underline" : ""} onClick={() => setOpenedMenu("style")}>Style</button>
              <button className={openedMenu === "mechanics" ? "underline" : ""} onClick={() => setOpenedMenu("mechanics")}>Mechanics</button>
            </span>

            <div className="flex flex-col gap-2">
              {openedMenu === "style" &&
                <>
                  <label className="flex gap-2">
                    Black hole radius:
                    <input value={siBhRadius} onChange={e => setSiBhRadius(+e.target.value)} />
                    <InlineMath math={String.raw`m`} />
                  </label>
                  {geoBhRadius !== 2 &&
                    <button onClick={() => setGeoBhRadius(2)}>
                      Set black hole radius equal to <InlineMath math={String.raw`r_s`} />
                    </button>
                  }
                  <label className="flex gap-2">
                    Black hole color:
                    <input type="color" value={bhColor} onChange={e => setBhColor(e.target.value)} />
                  </label>
                  <label className="flex gap-2">
                    Planet radius:
                    <input value={siPlanetRadius} onChange={e => setSiPlanetRadius(+e.target.value)} />
                    <InlineMath math={String.raw`m`} />
                  </label>
                  <label className="flex gap-2">
                    Planet color:
                    <input type="color" value={planetColor} onChange={e => setPlanetColor(e.target.value)} />
                  </label>

                  <label className="flex gap-2">
                    Trail: <input type="checkbox" checked={trailEnabled} onChange={e => { setTrailEnabled(e.target.checked) }} />
                  </label>
                  {trailEnabled &&
                    <>
                      <label className="flex gap-2">
                        Trail decay:
                        <input value={trailDecay} onChange={e => setTrailDecay(+e.target.value)} />
                        <InlineMath math={String.raw`s`} />
                      </label>
                      <label className="flex gap-2">
                        Trail color:
                        <input type="color" value={planetTrailColor} onChange={e => setPlanetTrailColor(e.target.value)} />
                      </label>
                    </>
                  }
                </>
              }
              {openedMenu === "mechanics" &&
                <>
                  <label className="flex gap-2">
                    Spinning: <input type="checkbox" checked={isBhSpinning} onChange={e => { setIsBhSpinning(e.target.checked) }} />
                  </label>
                  {isBhSpinning &&
                    <>
                      <label className="flex gap-2">
                        <InlineMath math="T_M " />
                        <input value={siBhRotationPeriod} onChange={e => setSiBhRotationPeriod(+e.target.value)} />
                        <InlineMath math={String.raw`s`} />
                      </label>
                      <label className="flex gap-2">
                        Arrow color:
                        <input type="color" value={arrowColor} onChange={e => setArrowColor(e.target.value)} />
                      </label>
                    </>
                  }

                  <label className="flex gap-2">
                    <span>Clamp <InlineMath math={String.raw`r \approx r_s`} />:</span>
                    <input type="checkbox" checked={clampR} onChange={e => { setClampR(e.target.checked) }} />
                  </label>

                  <label className="flex gap-2">
                    <InlineMath math="M" />
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
                    <input min={0} max={2 * Math.PI} value={phi} onChange={e => setPhi(+e.target.value)} />
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
                  </label>
                  <button onClick={() => setGeoPhiVel(getCircularOrbitPhiVelocity(geoR))}>
                    Set <InlineMath math={String.raw`\left.\frac{d\phi}{d\lambda}\right|_0`} /> to orbital velocity
                  </button>
                  <button onClick={() => setGeoRVel(getEscapeVelocity(geoR))}>
                    Set <InlineMath math={String.raw`\left.\frac{dr}{d\lambda}\right|_0`} /> to escape velocity
                  </button>
                  {isBhSpinning &&
                    <>
                      <button onClick={() => {
                        setGeoR(getCircularGeostationaryOrbitR(geoBhRotationPeriod))
                        setGeoPhiVel(getCircularGeostationaryOrbitPhiVelocity(geoBhRotationPeriod))
                      }}>
                        Set <InlineMath math={String.raw`r_0`} /> and <InlineMath math={String.raw`\left.\frac{d\phi}{d\lambda}\right|_0`} /> to have geostationary circular orbit
                      </button>
                    </>
                  }
                </>
              }
            </div>
          </>
        }
      </div>
      <div className="absolute top-0 right-0 p-4 flex flex-col rounded-tr-xl bg-gray-100 bg-opacity-75">
        <BlockMath math={String.raw`\begin{gather*}
          \begin{aligned}
          t &= ${Math.floor(siT * 100) / 100}\ s & \frac{dt}{d\lambda} &= ${Math.floor(tVel * 100) / 100} \\[1ex]
          r &= ${Math.floor(siR * 100) / 100}\ m & \frac{dr}{d\lambda} &= ${Math.floor(siRVel * 100) / 100}\ m\,s^{-1} \\[1ex]
          \phi &= ${Math.floor(clampAngle(phi) * 100) / 100} & \frac{d\phi}{d\lambda} &= ${Math.floor(siPhiVel * 100) / 100}\ s^{-1} \\[1ex]
          \end{aligned} \\
          \lambda = ${Math.floor(properTime * 100) / 100}\ s
        \end{gather*}`} />
        <span className={scaleChanged ? "text-red-500" : "transition-colors duration-1000"}>
          <BlockMath math={String.raw`\textrm{unit} = ${scale === 1 ? "" : String.raw`${1 / scale}\ `}r_s = ${Math.floor(1 / scale * lengthConversionFactor(siMass) * 2 * 100) / 100}\ m`} />
        </span>
        <button onClick={() => setScale(1)}>Reset scale</button>
      </div>
      <div ref={elementRef}>
        <Canvas draw={draw} />
      </div >
    </div >
  )
}
