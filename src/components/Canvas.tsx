import useCanvas, { DrawFunc } from "../utils/useCanvas"

type CanvasProps<T> = {
  draw: DrawFunc<T>
  width?: number
  height?: number
  initialState: T
}

export default function Canvas<T>({ draw, height, width, initialState }: CanvasProps<T>) {
  const canvasRef = useCanvas(draw, initialState)
  return <canvas ref={canvasRef} width={width ?? window.innerWidth} height={height ?? window.innerHeight} />
}
