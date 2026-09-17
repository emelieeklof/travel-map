/** A "thrifting" glyph — lucide's Shirt icon with a recycle-style arrow loop
 * around it (second-hand / reuse), matching lucide's stroke style (24x24
 * viewBox, currentColor stroke, round caps/joins). */
export function ThriftingIcon({
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
      <path d="M12 3a9 9 0 0 1 6.36 15.36" />
      <path d="m18.36 18.36 1.55-3.75-3.75-1.55" />
      <path d="M12 21a9 9 0 0 1-6.36-15.36" />
      <path d="m5.64 5.64-1.55 3.75 3.75 1.55" />
      <g transform="translate(6 6) scale(0.5)">
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
      </g>
    </svg>
  )
}
