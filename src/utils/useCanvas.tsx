import { useEffect, useRef } from "react"

export type DrawFunc<T> = (ctx: CanvasRenderingContext2D, t: number, dt: number, state: T) => T
export default function useCanvas<T>(draw: DrawFunc<T>, initialState: T) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const context = canvas.getContext('2d')!
    const startTime = Date.now() / 1000
    let dt = 0
    let t = 0
    let animationFrameId: number
    let state = initialState

    const render = () => {
      dt = Date.now() / 1000 - t
      t = Date.now() / 1000 - startTime

      context.clearRect(0, 0, context.canvas.width, context.canvas.height)
      state = draw(context, t, dt, state)

      animationFrameId = window.requestAnimationFrame(render)
    }
    render()

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [draw, initialState])

  return canvasRef
}
