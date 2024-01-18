import useCanvas, { DrawFunc } from "../utils/useCanvas"

type CanvasProps = {
  draw: DrawFunc
}

export default function Canvas({ draw }: CanvasProps) {
  const canvasRef = useCanvas(draw)
  return <canvas ref={canvasRef} />
}
