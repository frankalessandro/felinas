import { cloneElement, useId } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Label } from './Label'

interface ControlA11yProps {
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

interface FieldProps {
  label: string
  children: ReactElement<ControlA11yProps>
  hint?: ReactNode
  error?: string
  required?: boolean
  className?: string
}

/** Envuelve un control y conecta label, hint y error con `id`/`aria-*`. */
export function Field({ label, children, hint, error, required, className }: FieldProps) {
  const uid = useId()
  const controlId = children.props.id ?? `${uid}-control`
  const hintId = `${uid}-hint`
  const errorId = `${uid}-error`
  const describedBy = [error ? errorId : null, hint && !error ? hintId : null].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={controlId}>
        {label}
        {required && (
          <span aria-hidden className="ml-0.5 text-rosa-hover">
            *
          </span>
        )}
      </Label>
      {cloneElement(children, { id: controlId, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-fg-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
