import type { ProgressTone } from './ProgressBar'

const WARN_RATIO = 0.7

/** Disponible (<70%), casi lleno (70–99%) o lleno. */
export function getCapacityTone(booked: number, capacity: number): Extract<ProgressTone, 'ok' | 'warn' | 'danger'> {
  if (capacity <= 0 || booked >= capacity) return 'danger'
  return booked / capacity >= WARN_RATIO ? 'warn' : 'ok'
}
