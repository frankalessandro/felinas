/** Pantalla de carga: el logo respira sobre un halo suave. */
export function FullScreenLoader() {
  return (
    <div className="relative isolate grid min-h-dvh place-items-center overflow-hidden bg-bg" role="status" aria-live="polite">
      <div aria-hidden className="absolute left-1/2 top-1/2 -z-10 size-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rosa/15 blur-[110px]" />
      <div className="flex flex-col items-center gap-4">
        <img src="/logo.svg" alt="" className="size-14 animate-pulse motion-reduce:animate-none" />
        <p className="text-sm font-medium text-fg-muted">Cargando…</p>
        <span className="sr-only">Cargando la aplicación</span>
      </div>
    </div>
  )
}
