import { MessageCircle } from 'lucide-react'
import { buttonVariants } from '@/components/ui'
import { buildWhatsAppUrl } from '@/lib/whatsapp'

interface WhatsAppButtonProps {
  phone: string | null | undefined
  /** Nombre de la persona, para la etiqueta accesible. */
  name: string
  /** Mensaje ya escrito (ej. recordatorio de cobro). */
  message?: string
  /** `icon` para filas compactas, `sm`/`md` con texto. */
  size?: 'icon' | 'sm' | 'md'
  label?: string
}

/** Abre el chat de WhatsApp en una pestaña nueva. No se muestra si no hay teléfono utilizable. */
export function WhatsAppButton({ phone, name, message, size = 'sm', label = 'WhatsApp' }: WhatsAppButtonProps) {
  const url = buildWhatsAppUrl(phone, message)
  if (!url) return null
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${label} a ${name} por WhatsApp`}
      className={buttonVariants({ variant: 'secondary', size, className: 'min-h-11 text-ok hover:text-ok' })}
    >
      <MessageCircle className={size === 'icon' ? 'size-5' : 'size-4'} aria-hidden />
      {size !== 'icon' && label}
    </a>
  )
}
