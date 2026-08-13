// ============================================================
// pseudocode.js — generador y parser de pseudocódigo (español)
// ============================================================

import { programaDesde } from './ir.js'
import {
  normalizarLinea,
  partesDesdeCadena,
  partesAString,
  tipoNombre,
  tipoDesdeNombre,
} from './textutils.js'

// ---------------- generador ----------------

export function pseudoDesdePrograma(program) {
  const cuerpo = pseudoDesdePasos(program.pasos, 0)
  const lineas = ['Inicio', ...cuerpo, 'Fin']
  return lineas.join('\n')
}

function pseudoDesdePasos(pasos, nivel) {
  const sangria = '    '.repeat(nivel)
  const lineas = []
  for (const paso of pasos) {
    lineas.push(...pseudoDesdePaso(paso, nivel, sangria))
  }
  return lineas
}

function pseudoDesdePaso(paso, nivel, sangria) {
  switch (paso.type) {
    case 'inicio':
    case 'fin':
      return []
    case 'declarar':
      return [
        `${sangria}Declarar ${paso.nombre} como ${tipoNombre(paso.tipo)}${paso.valor != null ? ` = ${paso.valor}` : ''}`,
      ]
    case 'asignar':
      return [`${sangria}${paso.nombre} = ${paso.valor}`]
    case 'leer':
      return [`${sangria}Leer ${paso.variables.join(', ')}`]
    case 'mostrar':
      return [`${sangria}Escribir ${partesAString(paso.partes)}`]
    case 'si':
      return siPseudo(paso, nivel, sangria)
    case 'para':
      return paraPseudo(paso, nivel, sangria)
    case 'mientras':
      return mientrasPseudo(paso, nivel, sangria)
    case 'hacerMientras':
      return hacerMientrasPseudo(paso, nivel, sangria)
    case 'switch':
      return switchPseudo(paso, nivel, sangria)
    case 'break':
      return [`${sangria}Salir del ciclo`]
    case 'continue':
      return [`${sangria}Continuar`]
    default:
      return []
  }
}

function siPseudo(paso, nivel, sangria) {
  const lineas = [`${sangria}Si ${paso.condicion} Entonces`]
  lineas.push(...pseudoDesdePasos(paso.entonces, nivel + 1))
  if (paso.siNo.length) {
    lineas.push(`${sangria}Sino`)
    lineas.push(...pseudoDesdePasos(paso.siNo, nivel + 1))
  }
  lineas.push(`${sangria}Fin Si`)
  return lineas
}

function paraPseudo(paso, nivel, sangria) {
  const simple = formaParaSimple(paso)
  if (simple) {
    const lineas = [`${sangria}Para ${simple.inicio} Hasta ${simple.fin}${simple.step} Hacer`]
    lineas.push(...pseudoDesdePasos(paso.cuerpo, nivel + 1))
    lineas.push(`${sangria}Fin Para`)
    return lineas
  }
  const lineas = [
    `${sangria}Para (${paso.inicializacion}; ${paso.condicion}; ${paso.actualizacion}) Hacer`,
  ]
  lineas.push(...pseudoDesdePasos(paso.cuerpo, nivel + 1))
  lineas.push(`${sangria}Fin Para`)
  return lineas
}

function formaParaSimple(paso) {
  const mInit = /^(\w+)\s*=\s*(.+)$/.exec(paso.inicializacion)
  const mCond = /^(\w+)\s*(<=|>=)\s*(.+)$/.exec(paso.condicion)
  const mUpd = /^(\w+)\s*=\s*\1\s*(?:\+|-)\s*(.+)$/.exec(paso.actualizacion)
  if (mInit && mCond && mUpd && mInit[1] === mCond[1] && mCond[1] === mUpd[1]) {
    const desc = mCond[2] === '>='
    const pasoVal = mUpd[2].trim()
    const signo = desc ? '-' : ''
    const step = pasoVal === '1' && !desc ? '' : ` Paso ${signo}${pasoVal}`
    return { inicio: `${mInit[1]} = ${mInit[2].trim()}`, fin: mCond[3].trim(), step }
  }
  return null
}

function mientrasPseudo(paso, nivel, sangria) {
  const lineas = [`${sangria}Mientras ${paso.condicion} Hacer`]
  lineas.push(...pseudoDesdePasos(paso.cuerpo, nivel + 1))
  lineas.push(`${sangria}Fin Mientras`)
  return lineas
}

function hacerMientrasPseudo(paso, nivel, sangria) {
  const lineas = [`${sangria}Hacer`]
  lineas.push(...pseudoDesdePasos(paso.cuerpo, nivel + 1))
  lineas.push(`${sangria}Mientras que ${paso.condicion}`)
  return lineas
}

function switchPseudo(paso, nivel, sangria) {
  const lineas = [`${sangria}Según ${paso.expresion} Hacer`]
  const sangriaCaso = '    '.repeat(nivel + 1)
  for (const c of paso.casos) {
    lineas.push(`${sangriaCaso}Caso ${c.valor}:`)
    lineas.push(...pseudoDesdePasos(c.pasos, nivel + 2))
  }
  if (paso.defecto.length) {
    lineas.push(`${sangriaCaso}De Otro Modo:`)
    lineas.push(...pseudoDesdePasos(paso.defecto, nivel + 2))
  }
  lineas.push(`${sangria}Fin Según`)
  return lineas
}

// ---------------- parser ----------------

export function irDesdePseudo(source) {
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
    baja === 'fin si' ||
    baja === 'fin mientras' ||
    baja === 'fin para' ||
    /^fin\s+seg[úu]n\.?$/.test(baja) ||
    baja === 'fin' ||
    baja === 'sino' ||
    /^de\s+otro\s+modo:?$/.test(baja) ||
    /^caso\s+/i.test(baja) ||
    baja.startsWith('mientras que')
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
  if (baja === 'fin' || baja === 'fin si' || baja === 'fin mientras' || baja === 'fin para') {
    ctx.i++
    return null
  }
  if (baja.startsWith('mientras que')) {
    ctx.i++
    return null
  }
  if (baja.startsWith('si ') && baja.includes('entonces')) {
    const cond = extraerCondicion(linea)
    ctx.i++
    const entonces = parsearBloque(ctx)
    let siNo = []
    if (hayLinea(ctx) && lineaActual(ctx).toLowerCase() === 'sino') {
      ctx.i++
      siNo = parsearBloque(ctx)
    }
    if (hayLinea(ctx) && lineaActual(ctx).toLowerCase() === 'fin si') ctx.i++
    return { type: 'si', condicion: cond, entonces, siNo }
  }
  if (baja.startsWith('mientras ') && baja.endsWith('hacer')) {
    const cond = linea.slice('Mientras'.length, -'Hacer'.length).trim()
    ctx.i++
    const cuerpo = parsearBloque(ctx)
    if (hayLinea(ctx) && lineaActual(ctx).toLowerCase() === 'fin mientras') ctx.i++
    return { type: 'mientras', condicion: cond, cuerpo }
  }
  if (baja.startsWith('para ') && baja.includes('hacer')) {
    const para = parsePara(linea)
    ctx.i++
    const cuerpo = parsearBloque(ctx)
    if (hayLinea(ctx) && lineaActual(ctx).toLowerCase() === 'fin para') ctx.i++
    return para(cuerpo)
  }
  if (baja === 'hacer') {
    ctx.i++
    const cuerpo = parsearBloque(ctx)
    let cond = null
    if (hayLinea(ctx)) {
      const c = lineaActual(ctx).toLowerCase()
      if (c.startsWith('mientras que')) {
        cond = lineaActual(ctx).slice('Mientras que'.length).trim()
        ctx.i++
      }
    }
    if (cond == null) throw new Error('Se esperaba "Mientras que <condición>" tras "Hacer"')
    return { type: 'hacerMientras', cuerpo, condicion: cond }
  }
  if (/^seg[úu]n\s+/i.test(baja)) {
    return parseSegun(ctx, linea)
  }
  if (/^(salir(\s+del\s+ciclo)?|break)$/i.test(baja)) {
    ctx.i++
    return { type: 'break' }
  }
  if (/^(continuar|continue)$/i.test(baja)) {
    ctx.i++
    return { type: 'continue' }
  }
  if (baja.startsWith('declarar ')) {
    ctx.i++
    return parseDeclarar(linea)
  }
  if (baja.startsWith('escribir ')) {
    ctx.i++
    const contenido = linea.slice('Escribir'.length).trim()
    return { type: 'mostrar', partes: partesDesdeCadena(contenido) }
  }
  if (baja.startsWith('leer ')) {
    ctx.i++
    const contenido = linea.slice('Leer'.length).trim()
    const variables = contenido.split(',').map((v) => v.trim()).filter(Boolean)
    return { type: 'leer', variables }
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
  throw new Error(`No se reconoce la instrucción: "${linea}"`)
}

function extraerCondicion(linea) {
  const m = /^Si\s+(.*?)\s+Entonces\s*$/i.exec(linea)
  if (m) return m[1].trim()
  const m2 = /^Si\s+(.*)$/i.exec(linea)
  return m2 ? m2[1].replace(/\s+Entonces\s*$/i, '').trim() : ''
}

function parseDeclarar(linea) {
  // "Declarar x como entero" | "Declarar x" | "Declarar x como entero = 0"
  const contenido = linea.slice('Declarar'.length).trim()
  let m = /^(\w+)\s+como\s+(.+?)\s*=\s*(.+)$/i.exec(contenido)
  if (m) {
    return {
      type: 'declarar',
      nombre: m[1],
      tipo: tipoDesdeNombre(m[2]),
      valor: m[3].trim(),
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
  const m2 = /^(\w+)$/.exec(contenido)
  if (m2) {
    return { type: 'declarar', nombre: m2[1], tipo: 'int', valor: null }
  }
  throw new Error(`Declaración no válida: "${linea}"`)
}

function parseSegun(ctx, linea) {
  const expr = linea
    .replace(/^Seg[úu]n\s+/i, '')
    .replace(/\s+Hacer\s*$/i, '')
    .trim()
  ctx.i++
  const casos = []
  let defecto = []
  while (hayLinea(ctx)) {
    const l = lineaActual(ctx)
    const baja = l.toLowerCase()
    if (/^fin\s+seg[úu]n\.?$/.test(baja)) {
      ctx.i++
      break
    }
    if (/^de\s+otro\s+modo:?$/.test(baja)) {
      ctx.i++
      defecto = parsearBloque(ctx)
      if (hayLinea(ctx) && /^fin\s+seg[úu]n\.?$/i.test(lineaActual(ctx))) ctx.i++
      break
    }
    const mCaso = /^caso\s+(.+)$/i.exec(l)
    if (mCaso) {
      ctx.i++
      const pasos = parsearBloque(ctx)
      casos.push({ valor: mCaso[1].replace(/:$/, '').trim(), pasos })
    } else {
      throw new Error(
        `Se esperaba "Caso", "De Otro Modo" o "Fin Según" en el "Según" de "${expr}", se encontró: "${l}"`,
      )
    }
  }
  if (!casos.length && !defecto.length) {
    throw new Error(`El "Según" sobre "${expr}" no tiene casos.`)
  }
  return { type: 'switch', expresion: expr, casos, defecto }
}

function parsePara(linea) {
  const simple = /^Para\s+(\w+)\s*=\s*(.+?)\s+Hasta\s+(.+?)\s+(?:Paso\s+([+-]?.+?)\s+)?Hacer$/i.exec(linea)
  if (simple) {
    const [, nombre, inicio, fin, paso] = simple
    const pasoVal = paso ? paso.trim() : '1'
    const desc = pasoVal.startsWith('-')
    const valor = desc ? pasoVal.slice(1) : pasoVal
    return (cuerpo) => ({
      type: 'para',
      inicializacion: `${nombre} = ${inicio.trim()}`,
      condicion: `${nombre} ${desc ? '>=' : '<='} ${fin.trim()}`,
      actualizacion: `${nombre} = ${nombre} ${desc ? '-' : '+'} ${valor}`,
      cuerpo,
    })
  }
  // forma genérica: Para (init; cond; upd) Hacer
  const generico = /^Para\s*\(\s*(.+?)\s*;\s*(.+?)\s*;\s*(.+?)\s*\)\s*Hacer$/i.exec(linea)
  if (generico) {
    return (cuerpo) => ({
      type: 'para',
      inicializacion: generico[1].trim(),
      condicion: generico[2].trim(),
      actualizacion: generico[3].trim(),
      cuerpo,
    })
  }
  throw new Error(`Para no válido: "${linea}"`)
}
