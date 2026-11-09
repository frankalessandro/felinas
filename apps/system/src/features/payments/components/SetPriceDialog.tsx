import { Button, Dialog, Field, Input } from '@/components/ui'
import { useZodForm } from '@/hooks/useZodForm'
import { formatCOP, formatMoneyInput } from '@/lib/money'
import { useSetPlanPrice } from '../hooks/usePaymentMutations'
import { setPriceSchema } from '../schemas'

interface SetPriceDialogProps {
  studentPlanId: string
  planName: string
  currentPrice: number | null
  discountNote: string | null
  /** Precio de catálogo del plan, para dar contexto al descuento. */
  catalogPrice?: number | null
  onClose: () => void
}

const FORM_ID = 'set-price-form'

export function SetPriceDialog({ studentPlanId, planName, currentPrice, discountNote, catalogPrice, onClose }: SetPriceDialogProps) {
  const mutation = useSetPlanPrice()
  const form = useZodForm(setPriceSchema, {
    price: currentPrice !== null ? formatMoneyInput(String(currentPrice)) : '',
    discount_note: discountNote ?? '',
  })
  const { values, errors, setValue } = form
  const save = form.submit((data) =>
    mutation.mutateAsync({ studentPlanId, price: data.price, discountNote: data.discount_note }).then(onClose, () => undefined),
  )

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Valor del plan"
      description={`Cambia lo que paga esta alumna por ${planName}. Los pagos ya registrados se mantienen.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} loading={mutation.isPending}>
            Guardar valor
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={save} noValidate className="flex flex-col gap-4">
        <Field
          label="Valor a pagar (COP)"
          error={errors.price}
          required
          hint={catalogPrice ? `Precio de catálogo: ${formatCOP(catalogPrice)}. Escribe 0 si es cortesía.` : 'Escribe 0 si es cortesía.'}
        >
          <Input
            inputMode="numeric"
            autoComplete="off"
            value={values.price}
            onChange={(e) => setValue('price', formatMoneyInput(e.target.value))}
            className="h-14 font-display text-3xl font-bold tabular-nums text-ambar"
          />
        </Field>
        <Field label="Motivo del descuento" error={errors.discount_note} hint="Opcional. Ej. promo de mes, hermana, beca.">
          <Input value={values.discount_note} onChange={(e) => setValue('discount_note', e.target.value)} maxLength={120} />
        </Field>
      </form>
    </Dialog>
  )
}
