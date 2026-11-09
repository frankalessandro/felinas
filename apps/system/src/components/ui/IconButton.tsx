import type { ComponentProps } from 'react'
import { Button } from './Button'

type IconButtonProps = Omit<ComponentProps<typeof Button>, 'size' | 'aria-label'> & {
  'aria-label': string
}

export function IconButton({ variant = 'ghost', ...props }: IconButtonProps) {
  return <Button variant={variant} size="icon" {...props} />
}
