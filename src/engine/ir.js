// ============================================================
// ir.js — Modelo de Representación Intermedia (IR)
// Cada "programa" es { pasos: [nodo, ...] }
// Tipos de nodo: inicio, fin, declarar, mostrar, leer, asignar,
//                si, para, mientras, hacerMientras
// ============================================================

export const TIPOS = {
  INT: 'int',
  FLOAT: 'float',
  CHAR: 'char',
  STRING: 'string',
}

export const nInicio = () => ({ type: 'inicio' })
export const nFin = () => ({ type: 'fin' })

export const nDeclarar = (nombre, tipo = TIPOS.INT, valor = null) => ({
  type: 'declarar',
  nombre,
  tipo,
  valor,
})

export const nMostrar = (partes) => ({
  type: 'mostrar',
  partes,
})

export const parteTexto = (valor) => ({ tipo: 'texto', valor })
export const parteExpr = (valor) => ({ tipo: 'expr', valor })

export const mostrarTexto = (valor) => nMostrar([parteTexto(valor)])
export const mostrarExpr = (valor) => nMostrar([parteExpr(valor)])

export const nLeer = (variables) => ({ type: 'leer', variables })
export const nAsignar = (nombre, valor) => ({ type: 'asignar', nombre, valor })

export const nSi = (condicion, entonces, siNo = []) => ({
  type: 'si',
  condicion,
  entonces,
  siNo,
})

export const nPara = (inicializacion, condicion, actualizacion, cuerpo) => ({
  type: 'para',
  inicializacion,
  condicion,
  actualizacion,
  cuerpo,
})

export const nMientras = (condicion, cuerpo) => ({
  type: 'mientras',
  condicion,
  cuerpo,
})

export const nHacerMientras = (cuerpo, condicion) => ({
  type: 'hacerMientras',
  cuerpo,
  condicion,
})

export const programa = (pasos) => ({ pasos })

export const programaVacio = () => programa([nInicio(), nFin()])

// Crea un programa desde una lista de nodos, agregando inicio/fin si faltan.
export const programaDesde = (pasos) => {
  const p = []
  if (pasos[0]?.type !== 'inicio') p.push(nInicio())
  p.push(...pasos)
  if (p[p.length - 1]?.type !== 'fin') p.push(nFin())
  return programa(p)
}

// ------------------------------------------------
// Utilidades de recorrido
// ------------------------------------------------

export function recorrerPasos(pasos, fn) {
  for (const paso of pasos) {
    fn(paso)
    if (paso.type === 'si') {
      recorrerPasos(paso.entonces, fn)
      recorrerPasos(paso.siNo, fn)
    } else if (
      paso.type === 'para' ||
      paso.type === 'mientras' ||
      paso.type === 'hacerMientras'
    ) {
      recorrerPasos(paso.cuerpo, fn)
    }
  }
}

export function recorrerPrograma(program, fn) {
  recorrerPasos(program.pasos, fn)
}

// Tabla de símbolos: map nombre -> tipo (descubierta de los `declarar`)
export function tablaDeSimbolos(program) {
  const tabla = {}
  if (program) {
    recorrerPrograma(program, (paso) => {
      if (paso.type === 'declarar') tabla[paso.nombre] = paso.tipo
    })
  }
  return tabla
}
