// the head of the arrow forms a isosceles triangle where the top angle is a right angle and the height is headL
export function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, l: number, headL: number, angle: number) {
  const tipXLocal = l * Math.cos(angle)
  const tipYLocal = l * Math.sin(angle)
  const tipX = x + tipXLocal
  const tipY = y + tipYLocal
  const unitX = tipXLocal / l
  const unitY = tipYLocal / l

  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(tipX, tipY)
  ctx.stroke()
  ctx.closePath()

  const lengthWOHead = l - headL
  const headOnLineX = x + lengthWOHead * Math.cos(angle)
  const headOnLineY = y + lengthWOHead * Math.sin(angle)
  const head1X = headOnLineX - unitY * headL
  const head1Y = headOnLineY + unitX * headL
  const head2X = headOnLineX + unitY * headL
  const head2Y = headOnLineY - unitX * headL
  ctx.beginPath()
  ctx.moveTo(head1X, head1Y)
  ctx.lineTo(tipX, tipY)
  ctx.lineTo(head2X, head2Y)
  ctx.stroke()
  ctx.closePath()
}
