// ============================================================
// ir.js — Modelo de Representación Intermedia (IR)
// Cada "programa" es { pasos: [nodo, ...] }
// Tipos de nodo: inicio, fin, declarar, mostrar, leer, asignar,
//                si, para, mientras, hacerMientras, switch,
//                break, continue, funcion, devolver, llamar
// ============================================================

export const TIPOS = {
  INT: 'int',
  FLOAT: 'float',
  CHAR: 'char',
  STRING: 'string',
  BOOL: 'bool',
}

// Tipo de retorno de un procedimiento (sin valor).
export const RETORNO_VOID = 'void'

export const RETORNOS = {
  ...TIPOS,
  VOID: RETORNO_VOID,
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

export const nSwitch = (expresion, casos, defecto = []) => ({
  type: 'switch',
  expresion,
  casos,
  defecto,
})

export const nBreak = () => ({ type: 'break' })
export const nContinuar = () => ({ type: 'continue' })

// Un parámetro de función: `referencia` modela el `&` de C++.
export const parametro = (nombre, tipo = TIPOS.INT, referencia = false) => ({
  nombre,
  tipo,
  referencia,
})

// tipo: el tipo de retorno (incluye RETORNO_VOID para procedimientos)
export const nFuncion = (nombre, retorno, parametros = [], cuerpo = []) => ({
  type: 'funcion',
  nombre,
  retorno,
  parametros,
  cuerpo,
})

// valor: null representa un `return;` sin expresión
export const nDevolver = (valor = null) => ({ type: 'devolver', valor })

export const nLlamar = (nombre, argumentos = []) => ({
  type: 'llamar',
  nombre,
  argumentos,
})

export const programa = (pasos) => ({ pasos })

export const programaVacio = () => programa([nInicio(), nFin()])

// Crea un programa desde una lista de nodos, agregando inicio/fin si faltan.
// Las funciones se.groupizan justo después de `inicio`: es la orden canónica y
// permite que el generador de C++ las emita antes de main sin perder el round-trip.
export const programaDesde = (pasos) => {
  const funciones = pasos.filter((p) => p.type === 'funcion')
  const resto = pasos.filter((p) => p.type !== 'funcion')
  const p = []
  if (resto[0]?.type !== 'inicio') p.push(nInicio())
  p.push(...funciones)
  p.push(...resto)
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
    } else if (paso.type === 'switch') {
      for (const c of paso.casos) recorrerPasos(c.pasos, fn)
      recorrerPasos(paso.defecto, fn)
    } else if (paso.type === 'funcion') {
      recorrerPasos(paso.cuerpo, fn)
    }
  }
}

export function recorrerPrograma(program, fn) {
  recorrerPasos(program.pasos, fn)
}

// Tabla de símbolos: map nombre -> tipo (descubierta de los `declarar`).
// No incluye los parámetros de las funciones: ésos tienen ámbito propio y cada
// generador los siembra en la tabla cuando recorre el cuerpo de la función.
export function tablaDeSimbolos(program) {
  const tabla = {}
  if (program) {
    recorrerPrograma(program, (paso) => {
      if (paso.type === 'declarar') tabla[paso.nombre] = paso.tipo
    })
  }
  return tabla
}
