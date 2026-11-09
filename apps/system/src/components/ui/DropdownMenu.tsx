import * as Menu from '@radix-ui/react-dropdown-menu'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

export const DropdownMenu = Menu.Root
export const DropdownMenuTrigger = Menu.Trigger

export function DropdownMenuContent({ className, sideOffset = 6, align = 'end', ...props }: ComponentProps<typeof Menu.Content>) {
  return (
    <Menu.Portal>
      <Menu.Content
        sideOffset={sideOffset}
        align={align}
        className={cn('z-[60] min-w-48 rounded-xl border border-line-strong bg-surface-2 p-1 shadow-card animate-fade-up', className)}
        {...props}
      />
    </Menu.Portal>
  )
}

interface DropdownMenuItemProps extends ComponentProps<typeof Menu.Item> {
  tone?: 'default' | 'danger'
}

export function DropdownMenuItem({ className, tone = 'default', ...props }: DropdownMenuItemProps) {
  return (
    <Menu.Item
      className={cn(
        'flex min-h-11 cursor-pointer select-none items-center gap-2 rounded-lg px-3 text-sm outline-none data-[disabled]:opacity-40',
        tone === 'danger' ? 'text-danger data-[highlighted]:bg-danger-soft' : 'text-fg data-[highlighted]:bg-rosa-soft',
        className,
      )}
      {...props}
    />
  )
}

export function DropdownMenuLabel({ className, ...props }: ComponentProps<typeof Menu.Label>) {
  return <Menu.Label className={cn('px-3 py-2 text-xs font-semibold uppercase tracking-wider text-fg-subtle', className)} {...props} />
}

export function DropdownMenuSeparator({ className, ...props }: ComponentProps<typeof Menu.Separator>) {
  return <Menu.Separator className={cn('my-1 h-px bg-line', className)} {...props} />
}
