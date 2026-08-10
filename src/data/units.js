import { unidad1 } from './units/unit1.js'
import { unidad2 } from './units/unit2.js'
import { unidad3 } from './units/unit3.js'
import { unidad4 } from './units/unit4.js'

export const units = [unidad1, unidad2, unidad3, unidad4]

export function unidadPorId(id) {
  return units.find((u) => u.id === id) ?? null
}
