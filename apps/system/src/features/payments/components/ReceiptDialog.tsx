import { useQuery } from '@tanstack/react-query'
import { ExternalLink, FileText } from 'lucide-react'
import { IconTile } from '@/components/brand'
import { AsyncContent, Dialog, buttonVariants } from '@/components/ui'
import { receiptUrlQuery } from '../queries'

interface ReceiptDialogProps {
  path: string
  onClose: () => void
}

function isPdf(path: string): boolean {
  return path.toLowerCase().endsWith('.pdf')
}

/** Muestra el comprobante con una URL firmada de corta vida (el bucket es privado). */
export function ReceiptDialog({ path, onClose }: ReceiptDialogProps) {
  const query = useQuery(receiptUrlQuery(path))
  const url = query.data

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()} title="Comprobante de pago" className="md:max-w-2xl">
      <AsyncContent isLoading={query.isLoading} error={query.error} onRetry={() => query.refetch()}>
        {url && (
          <div className="flex flex-col gap-4">
            {isPdf(path) ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface-2 p-8 text-center">
                <IconTile icon={FileText} tone="rosa" size="lg" />
                <p className="max-w-xs text-sm text-fg-muted">El comprobante es un PDF. Ábrelo en una pestaña nueva para verlo o descargarlo.</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-line bg-surface-2 p-2">
                <img src={url} alt="Comprobante de pago" className="max-h-[60dvh] w-full rounded-xl object-contain" />
              </div>
            )}
            <a href={url} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: 'secondary', className: 'w-fit' })}>
              <ExternalLink className="size-4" aria-hidden /> Abrir en pestaña nueva
            </a>
          </div>
        )}
      </AsyncContent>
    </Dialog>
  )
}
