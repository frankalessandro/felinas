import { useState } from 'react'
import { cn } from '@/lib/cn'

const sizes = { sm: 'size-8 text-xs', md: 'size-10 text-sm', lg: 'size-14 text-lg', xl: 'size-20 text-2xl' } as const

interface AvatarProps {
  name: string
  src?: string | null
  size?: keyof typeof sizes
  className?: string
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showImage = Boolean(src) && failedSrc !== src

  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line-strong bg-gradient-felinas font-display font-extrabold text-white',
        sizes[size],
        className,
      )}
    >
      {showImage ? (
        <img src={src ?? undefined} alt="" className="size-full object-cover" onError={() => setFailedSrc(src ?? null)} />
      ) : (
        <span aria-hidden>{getInitials(name)}</span>
      )}
    </span>
  )
}
