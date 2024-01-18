import { useEffect, useRef } from "react"

type DrawFunc = (ctx: CanvasRenderingContext2D, frameCount: number) => void
type CanvasProps = {
  draw: DrawFunc
}
export function useCanvas(draw: DrawFunc) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const context = canvas.getContext('2d')!
    let frameCount = 0
    let animationFrameId: number

    const render = () => {
      frameCount++
      draw(context, frameCount)
      animationFrameId = window.requestAnimationFrame(render)
    }
    render()

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [draw])

  return canvasRef
}

export default function Canvas({ draw }: CanvasProps) {
  const canvasRef = useCanvas(draw)
  return <canvas ref={canvasRef} />
}
