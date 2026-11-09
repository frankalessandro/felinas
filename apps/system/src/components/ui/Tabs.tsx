import * as RadixTabs from '@radix-ui/react-tabs'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

export const Tabs = RadixTabs.Root

export function TabsList({ className, ...props }: ComponentProps<typeof RadixTabs.List>) {
  return <RadixTabs.List className={cn('hide-scrollbar flex gap-1 overflow-x-auto border-b border-line', className)} {...props} />
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof RadixTabs.Trigger>) {
  return (
    <RadixTabs.Trigger
      className={cn(
        'relative min-h-11 shrink-0 px-4 font-display text-sm font-bold text-fg-muted transition-colors hover:text-fg data-[state=active]:text-fg',
        'after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:bg-rosa after:opacity-0 after:transition-opacity data-[state=active]:after:opacity-100',
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: ComponentProps<typeof RadixTabs.Content>) {
  return <RadixTabs.Content className={cn('pt-4 outline-none', className)} {...props} />
}
