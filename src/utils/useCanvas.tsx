import { useEffect, useRef } from "react"

export type DrawFunc = (ctx: CanvasRenderingContext2D) => void
export default function useCanvas(draw: DrawFunc) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const context = canvas.getContext('2d')!
    let animationFrameId: number

    const render = () => {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height)
      draw(context)

      animationFrameId = window.requestAnimationFrame(render)
    }
    render()

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [draw])

  return canvasRef
}
