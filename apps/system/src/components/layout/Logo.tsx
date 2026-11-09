import { cn } from '@/lib/cn'

interface LogoProps {
  className?: string
  showWordmark?: boolean
}

export function Logo({ className, showWordmark = true }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <img src="/logo.svg" alt="" className="size-9 shrink-0" width={36} height={36} />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[15px] font-black uppercase tracking-[0.08em] text-fg">Felinas</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-rosa">System</span>
        </span>
      )}
    </span>
  )
}
