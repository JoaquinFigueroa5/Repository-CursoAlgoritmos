// ============================================================
// natural.js — generador y parser de algoritmo en idioma natural
// (plantillas controladas, en español)
// ============================================================

import { programaDesde } from './ir.js'
import {
  normalizarLinea,
  quitarConector,
  partesDesdeCadena,
  tipoNombre,
  tipoDesdeNombre,
} from './textutils.js'

// ---------------- generador ----------------

const OPERADORES = [
  ['>=', 'mayor o igual que'],
  ['<=', 'menor o igual que'],
  ['==', 'igual a'],
  ['!=', 'distinto de'],
  ['>', 'mayor que'],
  ['<', 'menor que'],
]

// Convierte una expresión aritmética a palabras (n + 1 -> n más 1).
function exprNatural(e) {
  const t = (e ?? '').trim()
  if (/^[+-]?\d+(\.\d+)?$/.test(t)) return t
  if (/^(["']).*\1$/.test(t)) return t
  return t
    .replace(/\s*\+\s*/g, ' más ')
    .replace(/\s*-\s*/g, ' menos ')
    .replace(/\s*\*\s*/g, ' por ')
    .replace(/\s*\/\s*/g, ' entre ')
    .replace(/\s*%\s*/g, ' mod ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Verbaliza una condición: n > 0 -> n es mayor que 0 (copula 'es' o 'sea').
function condicionNatural(expr, copula) {
  const s = (expr ?? '').trim()
  const partes = s.split(/\s*(&&|\|\|)\s*/)
  let out = comparacionNatural(partes[0], copula)
  for (let i = 1; i < partes.length; i += 2) {
    out += (partes[i] === '||' ? ' o ' : ' y ') + comparacionNatural(partes[i + 1], copula)
  }
  return out
}

function comparacionNatural(clause, copula) {
  const c = clause.trim()
  for (const [sym, frase] of OPERADORES) {
    const idx = c.indexOf(sym)
    if (idx === -1) continue
    return `${exprNatural(c.slice(0, idx))} ${copula} ${frase} ${exprNatural(c.slice(idx + sym.length))}`
  }
  return exprNatural(c)
}

function listaNatural(items) {
  if (items.length <= 2) return items.join(' y ')
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`
}

function partesNaturales(partes) {
  return partes
    .map((p) => (p.tipo === 'texto' ? `"${p.valor}"` : `el valor de ${p.valor}`))
    .join(', ')
}

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
        `${sangria}Declarar la variable ${paso.nombre} de tipo ${tipoNombre(paso.tipo)}${paso.valor != null ? ` e inicializarla en ${paso.valor}` : ''}.`,
      ]
    case 'asignar':
      return [asignarNatural(paso, sangria)]
    case 'leer':
      return leerNatural(paso, sangria)
    case 'mostrar':
      return [`${sangria}Mostrar ${partesNaturales(paso.partes)}.`]
    case 'si':
      return siNatural(paso, nivel, sangria)
    case 'para':
      return paraNatural(paso, nivel, sangria)
    case 'mientras':
      return mientrasNatural(paso, nivel, sangria)
    case 'hacerMientras':
      return hacerMientrasNatural(paso, nivel, sangria)
    case 'switch':
      return switchNatural(paso, nivel, sangria)
    case 'break':
      return [`${sangria}Salir del ciclo.`]
    case 'continue':
      return [`${sangria}Continuar.`]
    default:
      return []
  }
}

function asignarNatural(paso, sangria) {
  const mInc = /^(\w+)\s*=\s*\1\s*\+\s*(.+)$/.exec(paso.valor)
  if (mInc) return `${sangria}Incrementar ${paso.nombre} en ${mInc[2].trim()}.`
  const mDec = /^(\w+)\s*=\s*\1\s*-\s*(.+)$/.exec(paso.valor)
  if (mDec) return `${sangria}Disminuir ${paso.nombre} en ${mDec[2].trim()}.`
  return `${sangria}Asignar a ${paso.nombre} el valor de ${exprNatural(paso.valor)}.`
}

function leerNatural(paso, sangria) {
  if (paso.variables.length === 1) {
    return [`${sangria}Pedir el valor de ${paso.variables[0]}.`]
  }
  return [`${sangria}Pedir los valores de ${listaNatural(paso.variables)}.`]
}

function siNatural(paso, nivel, sangria) {
  const lineas = [`${sangria}Si ${condicionNatural(paso.condicion, 'es')}, entonces:`]
  lineas.push(...naturalDesdePasos(paso.entonces, nivel + 1))
  if (paso.siNo.length) {
    lineas.push(`${sangria}En caso contrario:`)
    lineas.push(...naturalDesdePasos(paso.siNo, nivel + 1))
  }
  lineas.push(`${sangria}Fin del si.`)
  return lineas
}

function paraNatural(paso, nivel, sangria) {
  const encabezado = encabezadoParaNatural(paso)
  const lineas = [`${sangria}${encabezado}:`]
  lineas.push(...naturalDesdePasos(paso.cuerpo, nivel + 1))
  lineas.push(`${sangria}Fin de la repetición.`)
  return lineas
}

// Describe el avance de un ciclo "para": { signo: '+'|'-', valor } o null.
// Reconoce variable++, variable--, +=, -=, y = variable +/- N.
function avanceDesdeActualizacion(nombre, actualizacion) {
  const s = (actualizacion ?? '').trim()
  const re = (patron) => new RegExp(`^${nombre}${patron}$`).exec(s)
  let m = re(`\\s*\\+\\+`)
  if (m) return { signo: '+', valor: '1' }
  m = re(`\\s*--`)
  if (m) return { signo: '-', valor: '1' }
  m = re(`\\s*\\+=\\s*(.+)`)
  if (m) return { signo: '+', valor: m[1].trim() }
  m = re(`\\s*-=\\s*(.+)`)
  if (m) return { signo: '-', valor: m[1].trim() }
  m = re(`\\s*=\\s*${nombre}\\s*\\+\\s*(.+)`)
  if (m) return { signo: '+', valor: m[1].trim() }
  m = re(`\\s*=\\s*${nombre}\\s*-\\s*(.+)`)
  if (m) return { signo: '-', valor: m[1].trim() }
  return null
}

// Reduce un "para" a contador simple si su inicialización, condición y
// actualización son reconocibles. Acepta tipo en la inicialización
// (int i = 1), cualquier comparador y ++/--/+=/-=/= var +/- N.
function paraSimple(paso) {
  const mInit = /^(?:[A-Za-z_][A-Za-z0-9_]*\s+)?(\w+)\s*=\s*(.+)$/.exec((paso.inicializacion ?? '').trim())
  const mCond = /^(\w+)\s*(<=|>=|<|>|==|!=)\s*(.+)$/.exec((paso.condicion ?? '').trim())
  if (!mInit || !mCond || mInit[1] !== mCond[1]) return null
  const avance = avanceDesdeActualizacion(mInit[1], paso.actualizacion)
  if (!avance) return null
  return {
    nombre: mInit[1],
    desde: mInit[2].trim(),
    operador: mCond[2],
    limite: mCond[3].trim(),
    ...avance,
  }
}

// Frase de movimiento: '' (avance de 1), " avanzando de 2", " retrocediendo de 1".
function fraseMovimiento(avance) {
  if (avance.signo === '-') return ` retrocediendo de ${exprNatural(avance.valor)}`
  return avance.valor === '1' ? '' : ` avanzando de ${exprNatural(avance.valor)}`
}

// Encabezado natural de un ciclo "para". Nunca emite "(init; cond; upd)".
function encabezadoParaNatural(paso) {
  const simple = paraSimple(paso)
  if (simple) {
    if (simple.operador === '<=' || simple.operador === '>=') {
      return `Repetir para ${simple.nombre} desde ${exprNatural(simple.desde)} hasta ${exprNatural(simple.limite)}${fraseMovimiento(simple)}`
    }
    const cond = condicionNatural(`${simple.nombre} ${simple.operador} ${simple.limite}`, 'sea')
    return `Repetir para ${simple.nombre} desde ${exprNatural(simple.desde)} mientras ${cond}${fraseMovimiento(simple)}`
  }

  // Fallback natural para casos atípicos: conserva variable/condición cuando
  // se pueden identificar y, si no, expresa la repetición condicionalmente.
  const mInit = /^(?:[A-Za-z_][A-Za-z0-9_]*\s+)?(\w+)\s*=\s*(.+)$/.exec((paso.inicializacion ?? '').trim())
  const mCond = /^(\w+)\s*(<=|>=|<|>|==|!=)\s*(.+)$/.exec((paso.condicion ?? '').trim())
  if (mInit && mCond && mInit[1] === mCond[1]) {
    const cond = condicionNatural(`${mCond[1]} ${mCond[2]} ${mCond[3]}`, 'sea')
    return `Repetir para ${mInit[1]} desde ${exprNatural(mInit[2].trim())} mientras ${cond}`
  }
  if (mCond) {
    return `Repetir mientras ${condicionNatural(`${mCond[1]} ${mCond[2]} ${mCond[3]}`, 'sea')}`
  }
  return `Repetir mientras ${condicionNatural(paso.condicion ?? '', 'sea')}`
}

function mientrasNatural(paso, nivel, sangria) {
  const lineas = [`${sangria}Repetir mientras ${condicionNatural(paso.condicion, 'sea')}:`]
  lineas.push(...naturalDesdePasos(paso.cuerpo, nivel + 1))
  lineas.push(`${sangria}Fin de la repetición.`)
  return lineas
}

function hacerMientrasNatural(paso, nivel, sangria) {
  const lineas = [`${sangria}Hacer:`]
  lineas.push(...naturalDesdePasos(paso.cuerpo, nivel + 1))
  lineas.push(`${sangria}y repetir mientras ${condicionNatural(paso.condicion, 'sea')}.`)
  return lineas
}

function switchNatural(paso, nivel, sangria) {
  const lineas = [`${sangria}Según sea ${paso.expresion}:`]
  const sangriaCaso = '    '.repeat(nivel + 1)
  for (const c of paso.casos) {
    lineas.push(`${sangriaCaso}En caso de ${c.valor}:`)
    lineas.push(...naturalDesdePasos(c.pasos, nivel + 2))
  }
  if (paso.defecto.length) {
    lineas.push(`${sangriaCaso}En caso contrario:`)
    lineas.push(...naturalDesdePasos(paso.defecto, nivel + 2))
  }
  lineas.push(`${sangria}Fin del según.`)
  return lineas
}

// ---------------- parser ----------------

const FRASE_A_OPERADOR = {
  'mayor o igual que': '>=',
  'menor o igual que': '<=',
  'mayor que': '>',
  'menor que': '<',
  'igual a': '==',
  'distinto de': '!=',
}

const FRASE_COMPARACION = /(?:es|sea)\s+(?:mayor o igual que|menor o igual que|mayor que|menor que|igual a|distinto de)/i

// Vuelve una condición natural a símbolos (n es mayor que 0 -> n > 0).
function condicionDesdeNatural(texto) {
  const s = (texto ?? '').trim()
  if (!FRASE_COMPARACION.test(s)) return s
  const preparado = s.replace(/\s+o\s+igual\s+que/gi, '__O_IGUAL__')
  const partes = preparado.split(/\s+(y|o)\s+/i)
  const frases = [partes[0].replace(/__O_IGUAL__/gi, ' o igual que')]
  const conectores = []
  for (let i = 1; i < partes.length; i += 2) {
    conectores.push(partes[i])
    frases.push(partes[i + 1].replace(/__O_IGUAL__/gi, ' o igual que'))
  }
  let out = comparacionDesdeNatural(frases[0])
  for (let i = 0; i < conectores.length; i++) {
    out += (conectores[i].toLowerCase() === 'o' ? ' || ' : ' && ') + comparacionDesdeNatural(frases[i + 1])
  }
  return out
}

function comparacionDesdeNatural(frase) {
  const m = /^(.+?)\s+(?:es|sea)\s+(mayor o igual que|menor o igual que|mayor que|menor que|igual a|distinto de)\s+(.+)$/i.exec(frase.trim())
  if (!m) throw new Error(`Condición no válida: "${frase}"`)
  return `${exprDesdeNatural(m[1])} ${FRASE_A_OPERADOR[m[2].toLowerCase()]} ${exprDesdeNatural(m[3])}`
}

// Vuelve una expresión en palabras a símbolos (n más 1 -> n + 1).
function exprDesdeNatural(e) {
  return (e ?? '')
    .replace(/\s+(?:más|mas)\s+/gi, ' + ')
    .replace(/\s+menos\s+/gi, ' - ')
    .replace(/\s+por\s+/gi, ' * ')
    .replace(/\s+entre\s+/gi, ' / ')
    .replace(/\s+mod\s+/gi, ' % ')
    .replace(/\s+/g, ' ')
    .trim()
}

function partesDesdeNatural(cadena) {
  return partesDesdeCadena(cadena).map((p) =>
    p.tipo === 'expr' ? { ...p, valor: p.valor.replace(/^el\s+valor\s+de\s+/i, '') } : p,
  )
}

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
    /^fin\s+(del\s+)?(mientras|para|seg[uú]n|switch)\.?$/i.test(baja) ||
    /^(en\s+caso\s+contrario|si\s+no|sino):?$/i.test(baja) ||
    /^en\s+caso\s+de\s+/i.test(baja) ||
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
    const cond = condicionDesdeNatural(
      linea.replace(/^Si\s+/i, '').replace(/,?\s+entonces:?$/i, '').replace(/:$/, '').trim(),
    )
    ctx.i++
    const entonces = parsearBloque(ctx)
    let siNo = []
    if (hayLinea(ctx) && /^(en\s+caso\s+contrario|si\s+no|sino):?$/i.test(lineaActual(ctx).trim())) {
      ctx.i++
      siNo = parsearBloque(ctx)
    }
    if (hayLinea(ctx) && /^fin\s+del\s+si\.?$/i.test(lineaActual(ctx))) ctx.i++
    if (hayLinea(ctx) && /^fin\s+si\.?$/i.test(lineaActual(ctx))) ctx.i++
    return { type: 'si', condicion: cond, entonces, siNo }
  }
  if (baja.startsWith('repetir mientras ')) {
    const cond = condicionDesdeNatural(
      linea.replace(/^Repetir\s+mientras\s+/i, '').replace(/:$/, '').trim(),
    )
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
        cond = condicionDesdeNatural(
          lineaActual(ctx).replace(/^y\s+repetir\s+mientras\s+/i, '').replace(/\.$/, '').trim(),
        )
        ctx.i++
      }
    }
    if (cond == null) {
      throw new Error('Se esperaba "y repetir mientras <condición>" tras "Hacer:"')
    }
    return { type: 'hacerMientras', cuerpo, condicion: cond }
  }
  if (baja.startsWith('según ') || baja.startsWith('segun ')) {
    const expr = linea
      .replace(/^Seg[úu]n\s+sea\s+/i, '')
      .replace(/^Seg[úu]n\s+/i, '')
      .trim()
    ctx.i++
    return parseSwitchNatural(ctx, expr)
  }
  if (/^(salir\s+del\s+ciclo|romper|interrumpir|break)$/i.test(linea)) {
    ctx.i++
    return { type: 'break' }
  }
  if (/^(continuar|continue)$/i.test(linea)) {
    ctx.i++
    return { type: 'continue' }
  }
  if (baja.startsWith('declarar ')) {
    ctx.i++
    return parseDeclarar(linea)
  }
  const mostrar = /^(mostrar|imprimir|escribir\s+en\s+pantalla)\s+(.*)$/i.exec(linea)
  if (mostrar) {
    ctx.i++
    return { type: 'mostrar', partes: partesDesdeNatural(mostrar[2]) }
  }
  const leer = /^(leer|pedir|solicitar)\s+(?:el\s+valor\s+de\s+|los\s+valores\s+de\s+|el\s+valor\s+)?(.+)$/i.exec(linea)
  if (leer) {
    ctx.i++
    const variables = leer[2]
      .split(/\s*,\s*|\s+y\s+/i)
      .map((v) => v.trim())
      .filter(Boolean)
    return { type: 'leer', variables }
  }
  const incrementar = /^incrementar\s+(\w+)\s+en\s+(.+)$/i.exec(linea)
  if (incrementar) {
    ctx.i++
    return { type: 'asignar', nombre: incrementar[1], valor: `${incrementar[1]} + ${incrementar[2].trim()}` }
  }
  const disminuir = /^disminuir\s+(\w+)\s+en\s+(.+)$/i.exec(linea)
  if (disminuir) {
    ctx.i++
    return { type: 'asignar', nombre: disminuir[1], valor: `${disminuir[1]} - ${disminuir[2].trim()}` }
  }
  const asignar = /^asignar\s+a\s+(\w+)\s+el\s+valor\s+(?:de\s+)?(.+)$/i.exec(linea)
  if (asignar) {
    ctx.i++
    return { type: 'asignar', nombre: asignar[1], valor: exprDesdeNatural(asignar[2]) }
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
  let m = /^(?:la\s+variable\s+)?(\w+)\s+de\s+tipo\s+(.+?)\s+e\s+inicializarla\s+en\s+(.+)$/i.exec(contenido)
  if (m) {
    return {
      type: 'declarar',
      nombre: m[1],
      tipo: tipoDesdeNombre(m[2]),
      valor: m[3].trim(),
    }
  }
  m = /^(\w+)\s+como\s+(.+?)\s+e\s+inicializarla\s+en\s+(.+)$/i.exec(contenido)
  if (m) {
    return {
      type: 'declarar',
      nombre: m[1],
      tipo: tipoDesdeNombre(m[2]),
      valor: m[3].trim(),
    }
  }
  m = /^(?:la\s+variable\s+)?(\w+)\s+de\s+tipo\s+(.+)$/i.exec(contenido)
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

function parseSwitchNatural(ctx, expresion) {
  const casos = []
  let defecto = []
  let encontrado = false
  while (hayLinea(ctx)) {
    const linea = lineaActual(ctx)
    const esCaso = /^en\s+caso\s+de\s+(.+)$/i.exec(linea)
    if (esCaso) {
      encontrado = true
      ctx.i++
      const pasos = parsearBloque(ctx)
      casos.push({ valor: esCaso[1].trim(), pasos })
    } else if (/^en\s+caso\s+contrario$/i.test(linea)) {
      encontrado = true
      ctx.i++
      defecto = parsearBloque(ctx)
      break
    } else if (/^fin\s+(del\s+)?(seg[uú]n|switch)\.?$/i.test(linea.toLowerCase())) {
      ctx.i++
      break
    } else {
      throw new Error(
        `Se esperaba "En caso de", "En caso contrario" o "Fin del según" en el Según de "${expresion}", se encontró: "${linea}"`,
      )
    }
  }
  if (!encontrado) throw new Error(`El "Según" sobre "${expresion}" no tiene casos.`)
  return { type: 'switch', expresion, casos, defecto }
}

function parseRepetirPara(linea) {
  const contenido = linea.replace(/^Repetir\s+para\s+/i, '').replace(/:$/, '')
  const m = /^(\w+)\s+desde\s+(.+?)\s+hasta\s+(.+?)(?:\s+avanzando\s+de\s+(.+?))?(?:\s+retrocediendo\s+de\s+(.+?))?$/i.exec(contenido)
  if (m) {
    const [, nombre, inicio, fin, avanzando, retrocediendo] = m
    const desc = retrocediendo != null
    const pasoVal = (desc ? retrocediendo : avanzando) || '1'
    return (cuerpo) => ({
      type: 'para',
      inicializacion: `${nombre} = ${exprDesdeNatural(inicio)}`,
      condicion: `${nombre} ${desc ? '>=' : '<='} ${exprDesdeNatural(fin)}`,
      actualizacion: `${nombre} = ${nombre} ${desc ? '-' : '+'} ${exprDesdeNatural(pasoVal)}`,
      cuerpo,
    })
  }
  const mMientras = /^(\w+)\s+desde\s+(.+?)\s+mientras\s+(.+?)(?:\s+avanzando\s+de\s+(.+?))?(?:\s+retrocediendo\s+de\s+(.+?))?$/i.exec(contenido)
  if (mMientras) {
    const [, nombre, inicio, condTexto, avanzando, retrocediendo] = mMientras
    const desc = retrocediendo != null
    const pasoVal = (desc ? retrocediendo : avanzando) || '1'
    let condicion
    try {
      condicion = condicionDesdeNatural(condTexto.trim())
    } catch {
      condicion = condTexto.trim()
    }
    return (cuerpo) => ({
      type: 'para',
      inicializacion: `${nombre} = ${exprDesdeNatural(inicio)}`,
      condicion,
      actualizacion: `${nombre} = ${nombre} ${desc ? '-' : '+'} ${exprDesdeNatural(pasoVal)}`,
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
