import { useState } from 'react'
import type { FormEvent } from 'react'
import type { z } from 'zod'

export type FormErrors<TValues> = Partial<Record<keyof TValues, string>>

function collectErrors<TValues>(error: z.ZodError): FormErrors<TValues> {
  const errors: FormErrors<TValues> = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key !== 'string') continue
    const field = key as keyof TValues
    if (!(field in errors)) errors[field] = issue.message
  }
  return errors
}

/**
 * Formulario controlado validado con zod. Los valores son los inputs crudos (strings, booleanos);
 * `submit` entrega la salida ya transformada del esquema, o pinta los errores por campo.
 */
export function useZodForm<TValues extends object, TOutput>(schema: z.ZodType<TOutput, TValues>, initialValues: TValues) {
  const [values, setValues] = useState<TValues>(initialValues)
  const [errors, setErrors] = useState<FormErrors<TValues>>({})

  function setValue<K extends keyof TValues>(key: K, value: TValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (key in prev ? { ...prev, [key]: undefined } : prev))
  }

  function submit(onValid: (data: TOutput) => void | Promise<void>) {
    return (event: FormEvent) => {
      event.preventDefault()
      const result = schema.safeParse(values)
      if (!result.success) {
        setErrors(collectErrors<TValues>(result.error))
        return
      }
      setErrors({})
      return onValid(result.data)
    }
  }

  return { values, errors, setValue, submit }
}
