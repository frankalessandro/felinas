import { Phone } from 'lucide-react'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { buttonVariants } from '@/components/ui'
import { buildTelUrl } from '@/lib/whatsapp'

interface StudentContactActionsProps {
  phone: string | null
  name: string
}

/** Llamar y WhatsApp con un toque. Sin teléfono no muestra nada. */
export function StudentContactActions({ phone, name }: StudentContactActionsProps) {
  const telUrl = buildTelUrl(phone)
  if (!telUrl) return null
  return (
    <div className="flex shrink-0 gap-2">
      <a href={telUrl} className={buttonVariants({ variant: 'secondary', size: 'icon' })} aria-label={`Llamar a ${name}`}>
        <Phone className="size-4" aria-hidden />
      </a>
      <WhatsAppButton phone={phone} name={name} size="icon" />
    </div>
  )
}
