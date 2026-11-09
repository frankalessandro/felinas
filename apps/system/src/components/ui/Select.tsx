import * as RadixSelect from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { controlClasses } from './fieldStyles'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  id?: string
  name?: string
  disabled?: boolean
  className?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
  'aria-label'?: string
}

export function Select({ options, value, onValueChange, placeholder = 'Selecciona…', name, disabled, className, id, ...aria }: SelectProps) {
  return (
    <RadixSelect.Root value={value} onValueChange={onValueChange} name={name} disabled={disabled}>
      <RadixSelect.Trigger
        id={id}
        className={cn(controlClasses, 'flex min-h-11 items-center justify-between gap-2 text-left data-[placeholder]:text-fg-subtle', className)}
        {...aria}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <ChevronDown className="size-4 text-fg-muted" aria-hidden />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={6}
          className="z-[70] max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-line-strong bg-surface-2 shadow-card animate-fade-up"
        >
          <RadixSelect.Viewport className="p-1">
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="relative flex min-h-11 cursor-pointer select-none items-center rounded-lg py-2 pl-9 pr-3 text-sm text-fg outline-none data-[disabled]:opacity-40 data-[highlighted]:bg-rosa-soft data-[highlighted]:text-fg"
              >
                <RadixSelect.ItemIndicator className="absolute left-3">
                  <Check className="size-4 text-rosa-hover" aria-hidden />
                </RadixSelect.ItemIndicator>
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  )
}
