import { useCallback } from "react";
import Canvas from "../components/Canvas";

export default function TwoD() {
  const draw = useCallback((ctx: CanvasRenderingContext2D, frameCount: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.arc(50, 100, 20 * Math.sin(frameCount * 0.05) ** 2, 0, 2 * Math.PI)
    ctx.fill()
  }, [])

  return <Canvas draw={draw} />
}
