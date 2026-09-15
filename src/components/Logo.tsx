export function Logo({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g fill="var(--color-primary, #a13920)">
        {/* Location pin outline */}
        <path
          fillRule="evenodd"
          d="M 250,85
             C 170,85 138,150 138,225
             C 138,285 185,348 250,428
             C 315,348 362,285 362,225
             C 362,150 330,85 250,85 Z
             M 250,118
             C 312,118 332,172 332,225
             C 332,272 292,328 250,392
             C 208,328 168,272 168,225
             C 168,172 188,118 250,118 Z"
        />
        {/* Top ribbon / bookmark */}
        <path d="M 237,112 L 263,112 L 263,197 L 250,172 L 237,197 Z" />
        {/* Sparkles */}
        <path d="M 308,212 Q 308,200 296,200 Q 308,200 308,188 Q 308,200 320,200 Q 308,200 308,212 Z" />
        <path d="M 223,322 Q 223,302 203,302 Q 223,302 223,282 Q 223,302 243,302 Q 223,302 223,322 Z" />
      </g>
    </svg>
  )
}
