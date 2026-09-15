export function Logo({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M42 22a20 20 0 0 0-20 20c0 15 20 30 20 30s20-15 20-30a20 20 0 0 0-20-20Z"
        fill="var(--color-primary, #a13920)"
      />
      <circle cx="65" cy="42" r="20" fill="none" stroke="var(--color-primary, #a13920)" strokeWidth="7" />
      <path d="M58 30h14v14l-7-4-7 4Z" fill="var(--color-primary, #a13920)" />
      <path d="M28 30l2 4 4 2-4 2-2 4-2-4-4-2 4-2Z" fill="var(--color-primary, #a13920)" />
    </svg>
  )
}
