import useCanvas, { DrawFunc } from "../utils/useCanvas"

type CanvasProps = {
  draw: DrawFunc
  width?: number
  height?: number
}

export default function Canvas({ draw, height, width }: CanvasProps) {
  const canvasRef = useCanvas(draw)
  return <canvas ref={canvasRef} width={width ?? window.innerWidth} height={height ?? window.innerHeight} />
}
