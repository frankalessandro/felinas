import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'
import { controlClasses } from './fieldStyles'

export function Textarea({ className, rows = 4, ...props }: ComponentProps<'textarea'>) {
  return <textarea rows={rows} className={cn(controlClasses, 'resize-y py-3', className)} {...props} />
}
