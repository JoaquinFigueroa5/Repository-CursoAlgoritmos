// ============================================================
// textutils.js — utilidades compartidas para texto
// ============================================================

import { parteTexto, parteExpr } from './ir.js'

// Normaliza una línea: espacios, puntuación final, comentarios.
export function normalizarLinea(linea) {
  let s = linea.trim()
  s = s.replace(/^\s*(\/\/|#|\(\*).*$/, '')
  s = s.replace(/\.+\s*$/, '')
  s = s.replace(/[:;\s]+$/, '')
  return s.trim()
}

// Conectores narrativos que se ignoran al inicio de una línea.
const CONECTORES = [
  'primero',
  'primero,',
  'luego',
  'luego,',
  'después',
  'despues',
  'después,',
  'despues,',
  'finalmente',
  'finalmente,',
  'a continuación',
  'a continuación,',
  'a continuacion',
]

export function quitarConector(linea) {
  const baja = linea.toLowerCase()
  for (const con of CONECTORES) {
    if (baja === con) return ''
    if (baja.startsWith(con + ' ')) return linea.slice(con.length).trim()
  }
  return linea
}

// Divide "Escribir a, b, c" en partes texto/expr respetando comillas.
export function partesDesdeCadena(str) {
  const partes = []
  let actual = ''
  let enComillas = null
  const flush = () => {
    const t = actual.trim()
    if (!t) return
    partes.push(
      enComillas === null && esCadena(t) ? parteTexto(descomillar(t)) : parteExpr(t),
    )
    actual = ''
  }
  for (let i = 0; i < str.length; i++) {
    const c = str[i]
    if (enComillas) {
      actual += c
      if (c === enComillas) enComillas = null
    } else if (c === '"' || c === "'") {
      enComillas = c
      actual += c
    } else if (c === ',') {
      flush()
    } else {
      actual += c
    }
  }
  flush()
  return partes
}

export function esCadena(str) {
  const t = str.trim()
  return (
    (t.startsWith('"') && t.endsWith('"') && t.length >= 2) ||
    (t.startsWith("'") && t.endsWith("'") && t.length >= 2)
  )
}

export function descomillar(str) {
  const t = str.trim()
  if (t.length >= 2 && ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'")))) {
    return t.slice(1, -1)
  }
  return t
}

// Convierte partes IR a una cadena legible: "texto", expr
export function partesAString(partes) {
  return partes
    .map((p) => (p.tipo === 'texto' ? `"${p.valor}"` : p.valor))
    .join(', ')
}

// Nombres de tipos en español
export const TIPO_NOMBRE = {
  int: 'entero',
  float: 'real',
  char: 'caracter',
  string: 'cadena',
}

export const NOMBRE_A_TIPO = {
  entero: 'int',
  real: 'float',
  caracter: 'char',
  cadena: 'string',
  int: 'int',
  float: 'float',
  char: 'char',
  string: 'string',
  entera: 'int',
}

export function tipoNombre(tipo) {
  return TIPO_NOMBRE[tipo] ?? tipo
}

export function tipoDesdeNombre(nombre) {
  return NOMBRE_A_TIPO[nombre.toLowerCase()] ?? 'int'
}
