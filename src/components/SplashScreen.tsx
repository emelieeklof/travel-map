import { Logo } from './Logo'

export function SplashScreen() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 bg-surface">
      <div className="relative flex items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-primary/25 animate-splash-pulse-ring" />
        <Logo size={72} className="relative animate-splash-icon" />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <h1 className="animate-splash-title font-serif text-4xl font-bold tracking-tight text-on-surface">
          SPOTTED
        </h1>
        <p className="animate-splash-tagline text-[11px] font-semibold uppercase tracking-[0.25em] text-on-surface-variant">
          Curated spots and creators
        </p>
      </div>
    </div>
  )
}
