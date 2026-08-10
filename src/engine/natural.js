// ============================================================
// natural.js — generador y parser de algoritmo en idioma natural
// (plantillas controladas, en español)
// ============================================================

import { programaDesde } from './ir.js'
import {
  normalizarLinea,
  quitarConector,
  partesDesdeCadena,
  partesAString,
  tipoNombre,
  tipoDesdeNombre,
} from './textutils.js'

// ---------------- generador ----------------

export function naturalDesdePrograma(program) {
  const cuerpo = naturalDesdePasos(program.pasos, 0)
  const lineas = ['Inicio', ...cuerpo, 'Fin']
  return lineas.join('\n')
}

function naturalDesdePasos(pasos, nivel) {
  const sangria = '    '.repeat(nivel)
  const lineas = []
  for (const paso of pasos) {
    lineas.push(...naturalDesdePaso(paso, nivel, sangria))
  }
  return lineas
}

function naturalDesdePaso(paso, nivel, sangria) {
  switch (paso.type) {
    case 'inicio':
    case 'fin':
      return []
    case 'declarar':
      return [
        `${sangria}Declarar la variable ${paso.nombre} de tipo ${tipoNombre(paso.tipo)}.`,
      ]
    case 'asignar':
      return [`${sangria}Asignar a ${paso.nombre} el valor ${paso.valor}.`]
    case 'leer':
      return leerNatural(paso, sangria)
    case 'mostrar':
      return [`${sangria}Mostrar ${partesAString(paso.partes)}.`]
    case 'si':
      return siNatural(paso, nivel, sangria)
    case 'para':
      return paraNatural(paso, nivel, sangria)
    case 'mientras':
      return mientrasNatural(paso, nivel, sangria)
    case 'hacerMientras':
      return hacerMientrasNatural(paso, nivel, sangria)
    default:
      return []
  }
}

function leerNatural(paso, sangria) {
  if (paso.variables.length === 1) {
    return [`${sangria}Leer el valor de ${paso.variables[0]}.`]
  }
  return [`${sangria}Leer los valores de ${paso.variables.join(', ')}.`]
}

function siNatural(paso, nivel, sangria) {
  const lineas = [`${sangria}Si ${paso.condicion}, entonces:`]
  lineas.push(...naturalDesdePasos(paso.entonces, nivel + 1))
  if (paso.siNo.length) {
    lineas.push(`${sangria}Si no:`)
    lineas.push(...naturalDesdePasos(paso.siNo, nivel + 1))
  }
  lineas.push(`${sangria}Fin del si.`)
  return lineas
}

function paraNatural(paso, nivel, sangria) {
  const simple = formaParaSimple(paso)
  const encabezado = simple
    ? `Repetir para ${simple.nombre} desde ${simple.desde} hasta ${simple.hasta}${simple.step}`
    : `Repetir para (${paso.inicializacion}; ${paso.condicion}; ${paso.actualizacion})`
  const lineas = [`${sangria}${encabezado}:`]
  lineas.push(...naturalDesdePasos(paso.cuerpo, nivel + 1))
  lineas.push(`${sangria}Fin de la repetición.`)
  return lineas
}

function formaParaSimple(paso) {
  const mInit = /^(\w+)\s*=\s*(.+)$/.exec(paso.inicializacion)
  const mCond = /^(\w+)\s*<=\s*(.+)$/.exec(paso.condicion)
  const mUpd = /^(\w+)\s*=\s*\1\s*\+\s*(.+)$/.exec(paso.actualizacion)
  if (mInit && mCond && mUpd && mInit[1] === mCond[1] && mCond[1] === mUpd[1]) {
    const step = mUpd[2].trim() === '1' ? '' : ` avanzando de ${mUpd[2].trim()}`
    return { nombre: mInit[1], desde: mInit[2].trim(), hasta: mCond[2].trim(), step }
  }
  return null
}

function mientrasNatural(paso, nivel, sangria) {
  const lineas = [`${sangria}Repetir mientras ${paso.condicion}:`]
  lineas.push(...naturalDesdePasos(paso.cuerpo, nivel + 1))
  lineas.push(`${sangria}Fin de la repetición.`)
  return lineas
}

function hacerMientrasNatural(paso, nivel, sangria) {
  const lineas = [`${sangria}Hacer:`]
  lineas.push(...naturalDesdePasos(paso.cuerpo, nivel + 1))
  lineas.push(`${sangria}y repetir mientras ${paso.condicion}.`)
  return lineas
}

// ---------------- parser ----------------

export function irDesdeNatural(source) {
  try {
    const lineas = prepararLineas(source)
    const ctx = { i: 0, lineas }
    const pasos = parsearBloque(ctx)
    return { ok: true, programa: programaDesde(pasos) }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

function prepararLineas(source) {
  return source
    .split('\n')
    .map((l) => l.replace(/\t/g, '    '))
    .map((l) => normalizarLinea(l))
    .map((l) => quitarConector(l))
    .filter((l) => l.length > 0)
}

function lineaActual(ctx) {
  return ctx.lineas[ctx.i]
}

function hayLinea(ctx) {
  return ctx.i < ctx.lineas.length
}

function esFinDeBloque(linea) {
  if (!linea) return false
  const baja = linea.toLowerCase()
  return (
    baja === 'fin' ||
    baja === 'fin del si' ||
    baja === 'fin si' ||
    baja === 'fin de la repetición' ||
    baja === 'fin de la repeticion' ||
    baja === 'fin repetir' ||
    /^(si\s+no|sino):?$/i.test(baja) ||
    baja.startsWith('y repetir mientras')
  )
}

function parsearBloque(ctx) {
  const pasos = []
  while (hayLinea(ctx)) {
    const linea = lineaActual(ctx)
    if (esFinDeBloque(linea)) break
    const paso = parsearLinea(ctx, linea)
    if (paso) pasos.push(paso)
  }
  return pasos
}

function parsearLinea(ctx, linea) {
  const baja = linea.toLowerCase()
  if (baja === 'inicio') {
    ctx.i++
    return null
  }
  if (baja === 'fin' || baja === 'fin del si' || baja === 'fin de la repetición' || baja === 'fin de la repeticion') {
    ctx.i++
    return null
  }
  if (/^(si\s+no|sino):?$/i.test(baja)) {
    ctx.i++
    return null
  }
  if (baja.startsWith('si ')) {
    const cond = linea.replace(/^Si\s+/i, '').replace(/,?\s+entonces:?$/i, '').replace(/:$/, '').trim()
    ctx.i++
    const entonces = parsearBloque(ctx)
    let siNo = []
    if (hayLinea(ctx) && /^(si\s+no|sino):?$/i.test(lineaActual(ctx).trim())) {
      ctx.i++
      siNo = parsearBloque(ctx)
    }
    if (hayLinea(ctx) && /^fin\s+del\s+si\.?$/i.test(lineaActual(ctx))) ctx.i++
    if (hayLinea(ctx) && /^fin\s+si\.?$/i.test(lineaActual(ctx))) ctx.i++
    return { type: 'si', condicion: cond, entonces, siNo }
  }
  if (baja.startsWith('repetir mientras ')) {
    const cond = linea.replace(/^Repetir\s+mientras\s+/i, '').replace(/:$/, '').trim()
    ctx.i++
    const cuerpo = parsearBloque(ctx)
    if (hayLinea(ctx) && esFinDeBloque(lineaActual(ctx))) ctx.i++
    return { type: 'mientras', condicion: cond, cuerpo }
  }
  if (baja.startsWith('repetir para ')) {
    const para = parseRepetirPara(linea)
    ctx.i++
    const cuerpo = parsearBloque(ctx)
    if (hayLinea(ctx) && esFinDeBloque(lineaActual(ctx))) ctx.i++
    return para(cuerpo)
  }
  if (baja === 'hacer' || baja === 'hacer:') {
    ctx.i++
    const cuerpo = parsearBloque(ctx)
    let cond = null
    if (hayLinea(ctx)) {
      const c = lineaActual(ctx).toLowerCase()
      if (c.startsWith('y repetir mientras ')) {
        cond = lineaActual(ctx).replace(/^y\s+repetir\s+mientras\s+/i, '').replace(/\.$/, '').trim()
        ctx.i++
      }
    }
    if (cond == null) {
      throw new Error('Se esperaba "y repetir mientras <condición>" tras "Hacer:"')
    }
    return { type: 'hacerMientras', cuerpo, condicion: cond }
  }
  if (baja.startsWith('declarar ')) {
    ctx.i++
    return parseDeclarar(linea)
  }
  const mostrar = /^(mostrar|imprimir|escribir\s+en\s+pantalla)\s+(.*)$/i.exec(linea)
  if (mostrar) {
    ctx.i++
    return { type: 'mostrar', partes: partesDesdeCadena(mostrar[2]) }
  }
  const leer = /^(leer|pedir|solicitar)\s+(?:el\s+valor\s+de\s+|los\s+valores\s+de\s+|el\s+valor\s+)?(.+)$/i.exec(linea)
  if (leer) {
    ctx.i++
    const variables = leer[2]
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
    return { type: 'leer', variables }
  }
  const asignar = /^asignar\s+a\s+(\w+)\s+el\s+valor\s+(.+)$/i.exec(linea)
  if (asignar) {
    ctx.i++
    return { type: 'asignar', nombre: asignar[1], valor: asignar[2] }
  }
  if (baja.includes('=')) {
    ctx.i++
    const [nombre, ...resto] = linea.split('=')
    return {
      type: 'asignar',
      nombre: nombre.trim(),
      valor: resto.join('=').trim(),
    }
  }
  throw new Error(`No se reconoce la frase: "${linea}"`)
}

function parseDeclarar(linea) {
  const contenido = linea.replace(/^Declarar\s+/i, '')
  let m = /^(?:la\s+variable\s+)?(\w+)\s+de\s+tipo\s+(.+)$/i.exec(contenido)
  if (m) {
    return {
      type: 'declarar',
      nombre: m[1],
      tipo: tipoDesdeNombre(m[2]),
      valor: null,
    }
  }
  m = /^(\w+)\s+como\s+(.+)$/i.exec(contenido)
  if (m) {
    return {
      type: 'declarar',
      nombre: m[1],
      tipo: tipoDesdeNombre(m[2]),
      valor: null,
    }
  }
  m = /^(\w+)$/.exec(contenido)
  if (m) {
    return { type: 'declarar', nombre: m[1], tipo: 'int', valor: null }
  }
  throw new Error(`Declaración no válida: "${linea}"`)
}

function parseRepetirPara(linea) {
  const contenido = linea.replace(/^Repetir\s+para\s+/i, '').replace(/:$/, '')
  const m = /^(\w+)\s+desde\s+(.+?)\s+hasta\s+(.+?)(?:\s+avanzando\s+de\s+(.+?))?$/i.exec(contenido)
  if (m) {
    const [, nombre, inicio, fin, paso] = m
    const pasoVal = paso ? paso.trim() : '1'
    return (cuerpo) => ({
      type: 'para',
      inicializacion: `${nombre} = ${inicio.trim()}`,
      condicion: `${nombre} <= ${fin.trim()}`,
      actualizacion: `${nombre} = ${nombre} + ${pasoVal}`,
      cuerpo,
    })
  }
  const generico = /^\(\s*(.+?)\s*;\s*(.+?)\s*;\s*(.+?)\s*\)$/.exec(contenido)
  if (generico) {
    return (cuerpo) => ({
      type: 'para',
      inicializacion: generico[1].trim(),
      condicion: generico[2].trim(),
      actualizacion: generico[3].trim(),
      cuerpo,
    })
  }
  throw new Error(`"Repetir para" no válido: "${linea}"`)
}
