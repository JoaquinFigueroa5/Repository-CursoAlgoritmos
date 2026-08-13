// ============================================================
// cpp.js — Generador y parser de C++ (librería stdio.h)
// ============================================================

import {
  TIPOS,
  tablaDeSimbolos,
  programaDesde,
  parteTexto,
  parteExpr,
} from './ir.js'

// ---------------- utilidades ----------------

const TIPO_CPP = {
  [TIPOS.INT]: 'int',
  [TIPOS.FLOAT]: 'float',
  [TIPOS.CHAR]: 'char',
  [TIPOS.STRING]: 'char[]',
}

const ESPECIFICADOR = {
  [TIPOS.INT]: '%d',
  [TIPOS.FLOAT]: '%f',
  [TIPOS.CHAR]: '%c',
  [TIPOS.STRING]: '%s',
}

function tipoPorDefecto(expr) {
  if (/^\d+\.\d/.test(expr)) return TIPOS.FLOAT
  if (/^[+-]?\d+$/.test(expr)) return TIPOS.INT
  return null
}

function escaparFormato(texto) {
  return texto
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/%/g, '%%')
    .replace(/\n/g, '\\n')
}

// ---------------- generador ----------------

export function cppDesdePrograma(program) {
  const tabla = tablaDeSimbolos(program)
  const cuerpo = cppDesdePasos(program.pasos, tabla).trimEnd()
  return `#include <stdio.h>

int main() {
${indentar(cuerpo)}
    return 0;
}
`
}

function cppDesdePasos(pasos, tabla) {
  return pasos
    .map((paso) => cppDesdePaso(paso, tabla))
    .filter((l) => l !== null && l.trim() !== '')
    .join('\n')
}

function cppDesdePaso(paso, tabla) {
  switch (paso.type) {
    case 'inicio':
    case 'fin':
      return null
    case 'declarar':
      return declararCpp(paso)
    case 'asignar':
      return `${paso.nombre} = ${paso.valor};`
    case 'leer':
      return leerCpp(paso, tabla)
    case 'mostrar':
      return mostrarCpp(paso, tabla)
    case 'si':
      return siCpp(paso, tabla)
    case 'para':
      return paraCpp(paso, tabla)
    case 'mientras':
      return mientrasCpp(paso, tabla)
    case 'hacerMientras':
      return hacerMientrasCpp(paso, tabla)
    case 'switch':
      return switchCpp(paso, tabla)
    case 'break':
      return 'break;'
    case 'continue':
      return 'continue;'
    default:
      return null
  }
}

function declararCpp(paso) {
  const valor = paso.valor != null ? ` = ${paso.valor}` : ''
  if (paso.tipo === TIPOS.STRING) {
    return `char ${paso.nombre}[100]${valor};`
  }
  const tipo = TIPO_CPP[paso.tipo] ?? 'int'
  return `${tipo} ${paso.nombre}${valor};`
}

function leerCpp(paso, tabla) {
  const specs = paso.variables
    .map((v) => ESPECIFICADOR[tabla[v]] ?? ESPECIFICADOR[TIPOS.INT])
    .join(' ')
  const refs = paso.variables
    .map((v) => (tabla[v] === TIPOS.STRING ? v : `&${v}`))
    .join(', ')
  return `scanf("${specs}", ${refs});`
}

function mostrarCpp(paso, tabla) {
  const partes = paso.partes
  const format = partes
    .map((p) =>
      p.tipo === 'texto'
        ? escaparFormato(p.valor)
        : (ESPECIFICADOR[tabla[p.valor]] ??
          ESPECIFICADOR[tipoPorDefecto(p.valor)] ??
          ESPECIFICADOR[TIPOS.INT]),
    )
    .join('')
  const conNuevaLinea = /(\\n)$/.test(format) || / $/.test(format)
  const final = conNuevaLinea ? format : format + '\\n'
  const args = partes.filter((p) => p.tipo === 'expr').map((p) => p.valor)
  const argsStr = args.length ? `, ${args.join(', ')}` : ''
  return `printf("${final}"${argsStr});`
}

function siCpp(paso, tabla) {
  const entonces = cppDesdePasos(paso.entonces, tabla)
  const siNo = cppDesdePasos(paso.siNo, tabla)
  const cuerpo = entonces ? indentar(entonces) : '// sin instrucciones'
  let out = `if (${paso.condicion}) {\n${cuerpo}\n}`
  if (siNo) {
    out += ` else {\n${indentar(siNo)}\n}`
  }
  return out
}

function paraCpp(paso, tabla) {
  const cuerpo = cppDesdePasos(paso.cuerpo, tabla)
  const contenido = cuerpo ? indentar(cuerpo) : '// sin instrucciones'
  return `for (${paso.inicializacion}; ${paso.condicion}; ${paso.actualizacion}) {\n${contenido}\n}`
}

function mientrasCpp(paso, tabla) {
  const cuerpo = cppDesdePasos(paso.cuerpo, tabla)
  const contenido = cuerpo ? indentar(cuerpo) : '// sin instrucciones'
  return `while (${paso.condicion}) {\n${contenido}\n}`
}

function hacerMientrasCpp(paso, tabla) {
  const cuerpo = cppDesdePasos(paso.cuerpo, tabla)
  const contenido = cuerpo ? indentar(cuerpo) : '// sin instrucciones'
  return `do {\n${contenido}\n} while (${paso.condicion});`
}

function switchCpp(paso, tabla) {
  const lineas = [`switch (${paso.expresion}) {`]
  for (const c of paso.casos) {
    lineas.push(`case ${c.valor}:`)
    const cuerpo = cppDesdePasos(c.pasos, tabla)
    if (cuerpo) lineas.push(indentar(cuerpo))
  }
  if (paso.defecto.length) {
    lineas.push('default:')
    const cuerpo = cppDesdePasos(paso.defecto, tabla)
    if (cuerpo) lineas.push(indentar(cuerpo))
  }
  lineas.push('}')
  return lineas.join('\n')
}

function indentar(texto) {
  return texto
    .split('\n')
    .map((l) => '    ' + l)
    .join('\n')
}

// ---------------- parser ----------------

export function irDesdeCPP(source) {
  try {
    const limpio = limpiarComentariosEInclude(source)
    const cuerpo = extraerCuerpoMain(limpio)
    const pasos = parsearPasos(cuerpo, new ParserContext(), true)
    return { ok: true, programa: programaDesde(pasos) }
  } catch (err) {
    return { ok: false, error: err.stack ?? err.message }
  }
}

class ParserContext {
  constructor() {
    this.i = 0
    this.src = ''
    this.tabla = {}
  }
}

function limpiarComentariosEInclude(source) {
  let s = source.replace(/\/\*[\s\S]*?\*\//g, '')
  s = s.replace(/\/\/.*$/gm, '')
  s = s
    .split('\n')
    .filter((l) => !/^\s*#/.test(l))
    .join('\n')
  return s
}

function extraerCuerpoMain(s) {
  // Busca "int main" y retorna el contenido de sus llaves.
  const idx = s.search(/\bmain\s*\(/)
  if (idx === -1) return s
  let i = idx + 4
  // saltar hasta la primera '{'
  while (i < s.length && s[i] !== '{') i++
  if (i >= s.length) throw new Error('No se encontró el bloque de main { ... }')
  const abrir = s.indexOf('{', i)
  const { cierre } = matchingBrace(s, abrir)
  return s.slice(abrir + 1, cierre)
}

function matchingBrace(s, openIdx) {
  let depth = 0
  let inStr = null
  for (let i = openIdx; i < s.length; i++) {
    const c = s[i]
    if (inStr) {
      if (c === '\\') {
        i++
        continue
      }
      if (c === inStr) inStr = null
      continue
    }
    if (c === '"' || c === "'") {
      inStr = c
      continue
    }
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) return { cierre: i, apertura: openIdx }
    }
  }
  throw new Error('Faltan llaves de cierre { }')
}

class Cursor {
  constructor(src) {
    this.src = src
    this.i = 0
  }
  peek(offset = 0) {
    return this.src[this.i + offset]
  }
  eof() {
    return this.i >= this.src.length
  }
  espacio() {
    while (!this.eof() && /\s/.test(this.src[this.i])) this.i++
  }
  palabra() {
    // lee una palabra [A-Za-z_][A-Za-z0-9_]*
    this.espacio()
    const m = /[A-Za-z_][A-Za-z0-9_]*/.exec(this.src.slice(this.i))
    if (!m) return null
    this.i += m[0].length
    return m[0]
  }
  consumir(char) {
    this.espacio()
    if (this.src[this.i] === char) {
      this.i++
      return true
    }
    return false
  }
  esperar(char) {
    this.espacio()
    if (this.src[this.i] !== char) {
      throw new Error(`Se esperaba "${char}"`)
    }
    this.i++
  }
}

function parsearPasos(cuerpo, ctx) {
  const cursor = new Cursor(cuerpo)
  cursor.i = 0
  return leerBloque(cursor, ctx)
}

function leerBloque(cursor, ctx) {
  const pasos = []
  while (true) {
    cursor.espacio()
    if (cursor.eof()) break
    if (cursor.peek() === '}') break
    if (cursor.peek() === ';') {
      cursor.i++
      continue
    }
    if (cursor.peek() === '{') {
      // bloque anónimo: no aporta nodo
      cursor.i++
      pasos.push(...leerBloque(cursor, ctx))
      cursor.consumir('}')
      continue
    }
    const paso = leerSentencia(cursor, ctx)
    if (paso) pasos.push(paso)
  }
  return pasos
}

function leerSentencia(cursor, ctx) {
  const palabra = cursor.palabra()
  if (!palabra) {
    cursor.i++
    return null
  }
  switch (palabra) {
    case 'if':
      return leerIf(cursor, ctx)
    case 'while':
      return leerWhile(cursor, ctx)
    case 'do':
      return leerDo(cursor, ctx)
    case 'for':
      return leerFor(cursor, ctx)
    case 'switch':
      return leerSwitch(cursor, ctx)
    case 'break':
      cursor.consumir(';')
      return { type: 'break' }
    case 'continue':
      cursor.consumir(';')
      return { type: 'continue' }
    case 'return':
      saltearHastaSemicolon(cursor)
      return null
    case 'int':
    case 'float':
    case 'double':
    case 'char':
      return leerDeclaracion(cursor, ctx, palabra)
    case 'printf':
      return leerPrintf(cursor)
    case 'scanf':
      return leerScanf(cursor)
    default:
      // intentar: identificador = expr; o palabra desconocida
      if (esIdentificador(palabra) && esAsignacion(cursor)) {
        return leerAsignacion(cursor, ctx, palabra)
      }
      // palabra desconocida (ej. std::cout, void) -> saltar hasta ';'
      saltearHastaSemicolon(cursor)
      return null
  }
}

function esIdentificador(p) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(p)
}

function esAsignacion(cursor) {
  const guard = cursor.i
  cursor.espacio()
  const a = cursor.src[cursor.i]
  const b = cursor.src[cursor.i + 1]
  cursor.i = guard
  if (a === '=') return true
  if ((a === '+' || a === '-' || a === '*' || a === '/' || a === '%') && b === '=') return true
  if ((a === '+' || a === '-') && b === a) return true
  return false
}

function saltearHastaSemicolon(cursor) {
  while (!cursor.eof() && cursor.peek() !== ';') cursor.i++
  if (!cursor.eof()) cursor.i++
}

function saltearHasta(cursor, char) {
  while (!cursor.eof() && cursor.src[cursor.i] !== char) cursor.i++
  if (!cursor.eof()) cursor.i++
}

function leerIf(cursor, ctx) {
  const cond = leerParens(cursor)
  const entonces = leerCuerpoObligatorio(cursor, ctx)
  let siNo = []
  const guard = cursor.i
  const siguiente = cursor.palabra()
  if (siguiente === 'else') {
    siNo = leerCuerpoObligatorio(cursor, ctx)
  } else {
    cursor.i = guard
  }
  return {
    type: 'si',
    condicion: cond,
    entonces,
    siNo,
  }
}

function leerWhile(cursor, ctx) {
  const cond = leerParens(cursor)
  const cuerpo = leerCuerpoObligatorio(cursor, ctx)
  return { type: 'mientras', condicion: cond, cuerpo }
}

function leerDo(cursor, ctx) {
  const cuerpo = leerCuerpoObligatorio(cursor, ctx)
  const w = cursor.palabra()
  if (w !== 'while') throw new Error('Se esperaba "while" después de "do { ... }"')
  const cond = leerParens(cursor)
  cursor.consumir(';')
  return { type: 'hacerMientras', cuerpo, condicion: cond }
}

function leerFor(cursor, ctx) {
  cursor.esperar('(')
  const init = leerHasta(cursor, ';')
  cursor.consumir(';')
  const cond = leerHasta(cursor, ';')
  cursor.consumir(';')
  const upd = leerHasta(cursor, ')')
  cursor.consumir(')')
  const cuerpo = leerCuerpoObligatorio(cursor, ctx)
  return {
    type: 'para',
    inicializacion: init.trim(),
    condicion: cond.trim(),
    actualizacion: upd.trim(),
    cuerpo,
  }
}

function leerSwitch(cursor, ctx) {
  const expr = leerParens(cursor)
  cursor.esperar('{')
  const casos = []
  let defecto = []
  while (true) {
    cursor.espacio()
    if (cursor.eof()) throw new Error('Switch sin llave de cierre "}"')
    if (cursor.peek() === '}') {
      cursor.i++
      break
    }
    const palabra = cursor.palabra()
    if (palabra === 'case') {
      const valor = leerHasta(cursor, ':').trim()
      cursor.consumir(':')
      casos.push({ valor, pasos: leerCuerpoSwitch(cursor, ctx) })
    } else if (palabra === 'default') {
      cursor.consumir(':')
      defecto = leerCuerpoSwitch(cursor, ctx)
    } else {
      throw new Error(
        `Se esperaba "case", "default" o "}" dentro del switch, se encontró "${palabra}"`,
      )
    }
  }
  if (!casos.length && !defecto.length) {
    throw new Error(`El switch sobre "${expr}" no tiene casos.`)
  }
  return { type: 'switch', expresion: expr, casos, defecto }
}

function leerCuerpoSwitch(cursor, ctx) {
  const pasos = []
  while (true) {
    cursor.espacio()
    if (cursor.eof()) break
    if (cursor.peek() === '}') break
    const guard = cursor.i
    const palabra = cursor.palabra()
    if (palabra === 'case' || palabra === 'default') {
      cursor.i = guard
      break
    }
    cursor.i = guard
    if (cursor.peek() === ';') {
      cursor.i++
      continue
    }
    const paso = leerSentencia(cursor, ctx)
    if (paso) pasos.push(paso)
  }
  return pasos
}

function leerParens(cursor) {
  cursor.esperar('(')
  const contenido = leerHasta(cursor, ')')
  cursor.consumir(')')
  return contenido.trim()
}

function leerHasta(cursor, chars) {
  // lee hasta cualquiera de los delimitadores a profundidad 0 (sin contar strings)
  const delims = Array.isArray(chars) ? chars : [chars]
  let out = ''
  let depth = 0
  let inStr = null
  while (!cursor.eof()) {
    const c = cursor.src[cursor.i]
    if (inStr) {
      out += c
      if (c === '\\') {
        cursor.i++
        out += cursor.src[cursor.i] ?? ''
        continue
      }
      if (c === inStr) inStr = null
      cursor.i++
      continue
    }
    if (c === '"' || c === "'") {
      inStr = c
      depth++
    } else if (c === '(' || c === '[') {
      depth++
    } else if (c === ')' || c === ']') {
      if (delims.includes(c) && depth === 0) {
        return out
      }
      depth--
    } else if (delims.includes(c) && depth === 0) {
      return out
    }
    out += c
    cursor.i++
  }
  throw new Error(`No se encontró "${delims.join('/')}"`)
}

function leerCuerpoObligatorio(cursor, ctx) {
  cursor.espacio()
  if (cursor.peek() === '{') {
    cursor.i++
    const pasos = leerBloque(cursor, ctx)
    cursor.consumir('}')
    return pasos
  }
  // un solo statement sin llaves
  const paso = leerSentencia(cursor, ctx)
  return paso ? [paso] : []
}

function leerDeclaracion(cursor, ctx, tipoCpp) {
  const nombre = cursor.palabra()
  if (!nombre) throw new Error('Declaración sin nombre de variable')
  let tipo = tipoDesdeCpp(tipoCpp)
  cursor.espacio()
  if (cursor.peek() === '[') {
    // char nombre[100] -> cadena
    saltearHasta(cursor, ']')
    tipo = TIPOS.STRING
  }
  let valor
  cursor.espacio()
  if (cursor.peek() === '=') {
    cursor.i++
    cursor.espacio()
    // leer valor hasta ';' o ','
    const v = leerHasta(cursor, ';')
    cursor.consumir(';')
    valor = v.trim()
    ctx.tabla[nombre] = tipo
    return { type: 'declarar', nombre, tipo, valor }
  }
  // puede ser "int x, y;" -> solo tomamos la primera por simplicidad
  saltearHastaSemicolon(cursor)
  ctx.tabla[nombre] = tipo
  return { type: 'declarar', nombre, tipo, valor: null }
}

function tipoDesdeCpp(t) {
  if (t === 'float' || t === 'double') return TIPOS.FLOAT
  if (t === 'char') return TIPOS.CHAR
  return TIPOS.INT
}

function leerAsignacion(cursor, ctx, nombre) {
  cursor.espacio()
  const a = cursor.src[cursor.i]
  const b = cursor.src[cursor.i + 1]
  let op = '='
  if ((a === '+' || a === '-') && b === a) {
    op = a + b
    cursor.i += 2
  } else if (a !== '=') {
    op = a + '='
    cursor.i += 2
  } else {
    cursor.consumir('=')
  }
  cursor.espacio()
  let valor
  if (op === '++') {
    valor = `${nombre} + 1`
  } else if (op === '--') {
    valor = `${nombre} - 1`
  } else {
    const rhs = leerHasta(cursor, ';').trim()
    valor = op === '=' ? rhs : `${nombre} ${op[0]} ${rhs}`
  }
  cursor.consumir(';')
  return { type: 'asignar', nombre, valor }
}

function leerPrintf(cursor) {
  cursor.esperar('(')
  const literal = leerStringLiteral(cursor)
  const args = leerArgumentos(cursor)
  cursor.consumir(';')
  return mostrarDesdePrintf(literal, args)
}

function leerArgumentos(cursor) {
  const args = []
  while (true) {
    cursor.espacio()
    if (cursor.peek() === ')') {
      cursor.i++
      break
    }
    if (cursor.peek() === ',') {
      cursor.i++
      continue
    }
    const arg = leerHasta(cursor, [',', ')'])
    args.push(arg.trim())
    cursor.espacio()
    if (cursor.peek() === ')') {
      cursor.i++
      break
    }
    if (cursor.peek() === ',') {
      cursor.i++
      continue
    }
    throw new Error('Se esperaba , o ) tras un argumento')
  }
  return args
}

function leerStringLiteral(cursor) {
  cursor.espacio()
  if (cursor.peek() !== '"') throw new Error('Se esperaba una cadena "..." en printf/scanf')
  cursor.i++
  let out = ''
  while (!cursor.eof()) {
    const c = cursor.src[cursor.i]
    if (c === '"') {
      cursor.i++
      return out
    }
    if (c === '\\') {
      const next = cursor.src[cursor.i + 1]
      if (next === 'n') {
        out += '\n'
        cursor.i += 2
        continue
      }
      if (next === 't') {
        out += '\t'
        cursor.i += 2
        continue
      }
      if (next === '"') {
        out += '"'
        cursor.i += 2
        continue
      }
      if (next === '%') {
        out += '%'
        cursor.i += 2
        continue
      }
      if (next === '\\') {
        out += '\\'
        cursor.i += 2
        continue
      }
      out += c
      cursor.i++
      continue
    }
    out += c
    cursor.i++
  }
  throw new Error('Cadena sin cerrar')
}

function mostrarDesdePrintf(literal, args) {
  // Reconstruye partes texto/expr a partir del formato y los argumentos.
  const partes = []
  const specs = /%(d|i|f|lf|c|s|%|u|ld)/g
  let m
  let idxArg = 0
  let ultimo = 0
  let coincide = false
  while ((m = specs.exec(literal)) !== null) {
    coincide = true
    if (m[0] === '%%') {
      partes.push(parteTexto(literal.slice(ultimo, m.index) + '%'))
      ultimo = m.index + 2
      continue
    }
    if (idxArg < args.length) {
      partes.push(parteTexto(literal.slice(ultimo, m.index)))
      partes.push(parteExpr(args[idxArg]))
      idxArg++
      ultimo = m.index + m[0].length
    } else {
      ultimo = m.index + m[0].length
    }
  }
  if (!coincide && args.length === 0) {
    return quitarSaltoFinal(partesFiltradas([parteTexto(literal)]))
  }
  if (ultimo < literal.length) {
    partes.push(parteTexto(literal.slice(ultimo)))
  }
  if (partes.length === 0) {
    partes.push(parteTexto(literal))
  }
  return quitarSaltoFinal(partesFiltradas(partes))
}

function partesFiltradas(partes) {
  return partes.filter((p) => p.tipo !== 'texto' || p.valor !== '')
}

function quitarSaltoFinal(partes) {
  // quitar el \n final que agrega el generador
  const ultimoParte = partes[partes.length - 1]
  if (ultimoParte && ultimoParte.tipo === 'texto' && ultimoParte.valor.endsWith('\n')) {
    ultimoParte.valor = ultimoParte.valor.slice(0, -1)
    if (ultimoParte.valor === '') partes.pop()
  }
  return { type: 'mostrar', partes }
}

function leerScanf(cursor) {
  cursor.esperar('(')
  leerStringLiteral(cursor)
  const args = leerArgumentos(cursor)
  const vars = args.map((a) => a.replace(/^&/, '')).filter((a) => esIdentificador(a))
  cursor.consumir(';')
  return { type: 'leer', variables: vars }
}

// ---------------- helpers exportados ----------------

export { parteTexto, parteExpr, TIPOS }
