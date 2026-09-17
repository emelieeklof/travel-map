/** A "surfing on a beach" glyph — no such icon exists in lucide-react, so this is
 * a hand-drawn stand-in matching lucide's stroke style (24x24 viewBox, currentColor
 * stroke, round caps/joins): a sun, a surfboard planted upright, and a wave line. */
export function SurfingIcon({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  className,
}: {
  size?: number | string
  color?: string
  strokeWidth?: number | string
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="5.5" cy="5" r="1.4" />
      <path d="M5.5 2v1" />
      <path d="M5.5 7v1" />
      <path d="M2.5 5h1" />
      <path d="M7.5 5h1" />
      <path d="M3.2 2.7l.7.7" />
      <path d="M7.1 6.6l.7.7" />
      <path d="M7.8 2.7l-.7.7" />
      <path d="M3.9 6.6l-.7.7" />
      <path d="M17 3c1.6 2.3 2.2 7 1.6 12-.3 2.3-.8 4-1.1 5.2l-.5-.7-.5.7c-.3-1.2-.8-2.9-1.1-5.2-.6-5 0-9.7 1.6-12Z" />
      <path d="M2 20.5c2.2-1.3 4.4-1.3 6.6 0s4.4 1.3 6.6 0 4.4-1.3 6.6 0" />
    </svg>
  )
}
