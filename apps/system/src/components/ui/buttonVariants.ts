import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const base =
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl font-display font-semibold tracking-tight transition-[transform,background-color,box-shadow,border-color,color] duration-150 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50 aria-busy:pointer-events-none'

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-rosa text-white shadow-[0_1px_0_0_#ffffff26_inset,0_8px_20px_-10px_#ea1a62cc] hover:bg-rosa-hover',
  secondary: 'border border-line bg-surface-2 text-fg hover:border-line-strong hover:bg-surface-3',
  ghost: 'text-fg-muted hover:bg-surface-2 hover:text-fg',
  outline: 'border border-rosa/50 text-rosa-hover hover:bg-rosa-soft',
  danger: 'border border-danger/30 bg-danger-soft text-danger hover:bg-danger hover:text-bg',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 text-xs',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-6 text-[15px]',
  icon: 'size-11 p-0',
}

interface ButtonVariantOptions {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
}

/** Clases del botón para reutilizarlas en enlaces (`<Link className={buttonVariants(...)}>`). */
export function buttonVariants({ variant = 'primary', size = 'md', className }: ButtonVariantOptions = {}): string {
  return cn(base, variants[variant], sizes[size], className)
}
