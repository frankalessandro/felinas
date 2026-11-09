import type { ComponentProps } from 'react'
import { Spinner } from './Spinner'
import { buttonVariants } from './buttonVariants'
import type { ButtonSize, ButtonVariant } from './buttonVariants'

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export function Button({ variant, size, loading = false, disabled, className, children, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonVariants({ variant, size, className })}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
