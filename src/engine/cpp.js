// ============================================================
// cpp.js — Generador y parser de C++ (librería stdio.h)
// Soporta: main, funciones, procedimientos, llamadas, return con
//          valor, parámetros por referencia y varias variables por
//          declaración. Lo que no reconoce lo descarta con un aviso.
// ============================================================

import {
  TIPOS,
  RETORNO_VOID,
  parametro,
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
  [TIPOS.BOOL]: 'bool',
}

const TIPO_CPP_RETORNO = {
  ...TIPO_CPP,
  [RETORNO_VOID]: 'void',
}

const ESPECIFICADOR = {
  [TIPOS.INT]: '%d',
  [TIPOS.FLOAT]: '%f',
  [TIPOS.CHAR]: '%c',
  [TIPOS.STRING]: '%s',
  [TIPOS.BOOL]: '%d',
}

const SIN_INSTRUCCIONES = '// sin instrucciones'

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
  // Las funciones se emiten antes de main porque main necesita verlas declaradas.
  const funciones = program.pasos.filter((p) => p.type === 'funcion')
  const cuerpo = cppDesdePasos(
    program.pasos.filter((p) => p.type !== 'funcion'),
    tabla,
  ).trimEnd()
  const antes = funciones.length
    ? funciones.map((f) => cppDesdeFuncion(f, tabla)).join('\n\n') + '\n\n'
    : ''
  const contenido = cuerpo ? indentar(cuerpo) : `    ${SIN_INSTRUCCIONES}`
  return `#include <stdio.h>

${antes}int main() {
${contenido}
    return 0;
}
`
}

function cppDesdeFuncion(paso, tabla) {
  const params = paso.parametros.map(tipoParamCpp).join(', ')
  // Los parámetros tienen ámbito propio: se siembran en la tabla para que los
  // especificadores de printf/scanf salgan con el tipo correcto.
  const tablaLocal = { ...tabla }
  for (const p of paso.parametros) tablaLocal[p.nombre] = p.tipo
  const cuerpo = cppDesdePasos(paso.cuerpo, tablaLocal)
  const retorno = TIPO_CPP_RETORNO[paso.retorno] ?? TIPO_CPP[paso.retorno] ?? 'int'
  return `${retorno} ${paso.nombre}(${params}) {\n${cuerpo ? indentar(cuerpo) : `    ${SIN_INSTRUCCIONES}`}\n}`
}

function tipoParamCpp(p) {
  const base = TIPO_CPP[p.tipo] ?? 'int'
  return p.referencia ? `${base} &${p.nombre}` : `${base} ${p.nombre}`
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
    case 'llamar':
      return `${paso.nombre}(${paso.argumentos.join(', ')});`
    case 'devolver':
      return paso.valor == null ? 'return;' : `return ${paso.valor};`
    case 'funcion':
      return cppDesdeFuncion(paso, tabla)
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
  const cuerpo = entonces ? indentar(entonces) : SIN_INSTRUCCIONES
  let out = `if (${paso.condicion}) {\n${cuerpo}\n}`
  if (siNo) {
    out += ` else {\n${indentar(siNo)}\n}`
  }
  return out
}

function paraCpp(paso, tabla) {
  const cuerpo = cppDesdePasos(paso.cuerpo, tabla)
  const contenido = cuerpo ? indentar(cuerpo) : SIN_INSTRUCCIONES
  return `for (${paso.inicializacion}; ${paso.condicion}; ${paso.actualizacion}) {\n${contenido}\n}`
}

function mientrasCpp(paso, tabla) {
  const cuerpo = cppDesdePasos(paso.cuerpo, tabla)
  const contenido = cuerpo ? indentar(cuerpo) : SIN_INSTRUCCIONES
  return `while (${paso.condicion}) {\n${contenido}\n}`
}

function hacerMientrasCpp(paso, tabla) {
  const cuerpo = cppDesdePasos(paso.cuerpo, tabla)
  const contenido = cuerpo ? indentar(cuerpo) : SIN_INSTRUCCIONES
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
  const avisos = []
  try {
    const limpio = limpiarComentariosEInclude(source)
    const { funciones, cuerpoMain } = partirTopLevel(limpio, avisos)
    const ctx = new ParserContext(avisos)
    ctx.nombresFunciones = new Set(funciones.map((f) => f.nombre))
    const pasosMain = cuerpoMain == null ? [] : quitarReturnFinal(leerPasos(cuerpoMain, ctx))
    const nodosFuncion = funciones.map((f) => ({
      type: 'funcion',
      nombre: f.nombre,
      retorno: retornoDesdeCpp(f.tipo),
      parametros: leerParametros(f.params, ctx),
      cuerpo: leerPasos(f.cuerpo, ctx),
    }))
    return { ok: true, programa: programaDesde([...nodosFuncion, ...pasosMain]), avisos }
  } catch (err) {
    return { ok: false, error: err.message, avisos }
  }
}

// El `return 0;` que el generador pone al final de main no es un paso del IR.
function quitarReturnFinal(pasos) {
  const ultimo = pasos[pasos.length - 1]
  if (ultimo?.type === 'devolver' && (ultimo.valor == null || ultimo.valor === '0')) {
    return pasos.slice(0, -1)
  }
  return pasos
}

class ParserContext {
  constructor(avisos = []) {
    this.avisos = avisos
    this.nombresFunciones = new Set()
    this.tabla = {}
  }

  avisar(msg) {
    this.avisos.push(msg)
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

// Parte el fuente a profundidad 0. Cada definición `<tipo> <nombre>(<params>){...}`
// se convierte en un registro de función y `main` aporta el cuerpo del programa.
function partirTopLevel(s, avisos) {
  const funciones = []
  let cuerpoMain = null
  let i = 0
  while (i < s.length) {
    if (/\s/.test(s[i]) || s[i] === ';' || s[i] === '}') {
      i++
      continue
    }
    const cab = leerCabeceraTopLevel(s, i)
    if (cab) {
      if (cab.cuerpo == null) {
        i = cab.fin // prototipo: se ignora
      } else {
        if (cab.nombre === 'main') cuerpoMain = cab.cuerpo
        else funciones.push(cab)
        i = cab.fin
      }
      continue
    }
    // Cualquier otra cosa a nivel superior (using, namespace, typedef, struct...)
    // no tiene representación en el IR: se descarta y se avisa.
    const trozo = s.slice(i)
    const hasta = trozo.indexOf(';')
    const texto = (hasta === -1 ? trozo : trozo.slice(0, hasta)).trim()
    if (texto) avisos.push(`Se ignoró el código de nivel superior "${primeraLinea(texto)}".`)
    i = hasta === -1 ? s.length : i + hasta + 1
  }
  if (cuerpoMain == null && funciones.length === 0) {
    throw new Error('No se encontró ninguna función main ni ninguna función definida.')
  }
  return { funciones, cuerpoMain }
}

function primeraLinea(texto) {
  const l = texto.split('\n')[0].trim()
  return l.length > 60 ? `${l.slice(0, 60)}...` : l
}

// Desde `i` lee un encabezado de función a nivel superior.
// Devuelve { tipo, nombre, params, cuerpo, fin } para una definición con cuerpo,
// { tipo, nombre, params, cuerpo: null, fin } para un prototipo, o null si no
// parece una función.
function leerCabeceraTopLevel(s, i) {
  const m = /^\s*(int|float|double|char|bool|void)\b/.exec(s.slice(i))
  if (!m) return null
  const tipo = m[1]
  const tras = i + m[0].length
  const mNombre = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*(?=[(<])/.exec(s.slice(tras))
  if (!mNombre) return null
  const nombre = mNombre[1]
  const iniParams = tras + mNombre[0].length
  if (s[iniParams] !== '(') return null
  const finParams = buscarCierre(s, iniParams, '(', ')')
  if (finParams === -1) return null
  const params = s.slice(iniParams + 1, finParams)
  let f = finParams + 1
  while (f < s.length && /\s/.test(s[f])) f++
  if (s[f] === ';') {
    return { tipo, nombre, params, cuerpo: null, fin: f + 1 }
  }
  if (s[f] !== '{') return null
  const { cierre } = matchingBrace(s, f)
  return { tipo, nombre, params, cuerpo: s.slice(f + 1, cierre), fin: cierre + 1 }
}

function buscarCierre(s, desde, abre, cierra) {
  let depth = 0
  for (let i = desde; i < s.length; i++) {
    if (s[i] === abre) depth++
    else if (s[i] === cierra) {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
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

// Normaliza lo que devuelve leerSentencia: un paso, varios o ninguno.
function aPasos(x) {
  if (x == null) return []
  return Array.isArray(x) ? x : [x]
}

function leerPasos(cuerpo, ctx) {
  const cursor = new Cursor(cuerpo)
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
    pasos.push(...aPasos(leerSentencia(cursor, ctx)))
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
      return leerReturn(cursor)
    case 'int':
    case 'float':
    case 'double':
    case 'char':
    case 'bool':
      return leerDeclaracion(cursor, ctx, palabra)
    case 'printf':
      return leerPrintf(cursor)
    case 'scanf':
      return leerScanf(cursor)
    default:
      if (!esIdentificador(palabra)) {
        // palabra reservada desconocida (p.ej. void, static) -> saltar hasta ';'
        saltearHastaSemicolon(cursor)
        return null
      }
      if (esLlamada(cursor)) return leerLlamada(cursor, ctx, palabra)
      if (esAsignacion(cursor)) return leerAsignacion(cursor, ctx, palabra)
      if (ctx.nombresFunciones.has(palabra)) {
        ctx.avisar(`La función "${palabra}" se usó sin paréntesis y se descartó.`)
      } else {
        ctx.avisar(`Se descartó la instrucción desconocida "${palabra} ...".`)
      }
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

function esLlamada(cursor) {
  const guard = cursor.i
  cursor.espacio()
  const esParen = cursor.src[cursor.i] === '('
  cursor.i = guard
  return esParen
}

function saltearHastaSemicolon(cursor) {
  while (!cursor.eof() && cursor.peek() !== ';') cursor.i++
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
    pasos.push(...aPasos(leerSentencia(cursor, ctx)))
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
  return aPasos(leerSentencia(cursor, ctx))
}

// "int num, a = 5, b = 7;" -> tres nodos declarar
function leerDeclaracion(cursor, ctx, tipoCpp) {
  const declaradores = leerHasta(cursor, ';')
  cursor.consumir(';')
  const pasos = []
  for (const d of dividirArgs(declaradores)) {
    const paso = leerDeclarador(d, tipoDesdeCpp(tipoCpp), ctx)
    if (paso) pasos.push(paso)
  }
  return pasos
}

function leerDeclarador(texto, tipo, ctx) {
  let t = texto.trim()
  if (!t) return null
  let tipoFinal = tipo
  if (/\[[^\]]*\]/.test(t)) {
    tipoFinal = TIPOS.STRING
    t = t.replace(/\[[^\]]*\]/g, '')
  }
  const m = /^([A-Za-z_][A-Za-z0-9_]*)\s*(?:=\s*([\s\S]+))?$/.exec(t.trim())
  if (!m) return null
  const nombre = m[1]
  const valor = m[2] != null ? m[2].trim() : null
  ctx.tabla[nombre] = tipoFinal
  return { type: 'declarar', nombre, tipo: tipoFinal, valor }
}

// "int n, bool primo, int &a" -> [parametro(...), ...]
function leerParametros(texto, ctx) {
  const params = []
  for (const bruto of dividirArgs(texto)) {
    const t = bruto.trim()
    if (!t) continue
    const referencia = t.includes('&')
    const sinAmp = t.replace(/&/g, ' ').trim().replace(/\s+/g, ' ')
    const esCadena = /\[[^\]]*\]\s*$/.test(sinAmp)
    const limpio = sinAmp.replace(/\[[^\]]*\]/g, '').trim()
    const mTipado =
      /^(?:(?:unsigned|signed|long|short)\s+)*(int|float|double|char|bool|string|void)\s+([A-Za-z_][A-Za-z0-9_]*)$/i.exec(
        limpio,
      )
    const mSimple = /^([A-Za-z_][A-Za-z0-9_]*)$/.exec(limpio)
    let nombre
    let tipo
    if (mTipado) {
      nombre = mTipado[2]
      tipo = tipoDesdeCpp(mTipado[1])
    } else if (mSimple) {
      nombre = mSimple[1]
      tipo = TIPOS.INT
    } else {
      ctx.avisar(`Se ignoró el parámetro no reconocido "${t}".`)
      continue
    }
    if (esCadena) tipo = TIPOS.STRING
    params.push(parametro(nombre, tipo, referencia))
  }
  return params
}

function dividirArgs(texto) {
  const out = []
  let depth = 0
  let actual = ''
  for (const c of texto) {
    if (c === '(' || c === '[') depth++
    else if (c === ')' || c === ']') depth--
    if (c === ',' && depth === 0) {
      out.push(actual)
      actual = ''
      continue
    }
    actual += c
  }
  out.push(actual)
  return out
}

function tipoDesdeCpp(t) {
  if (t === 'float' || t === 'double') return TIPOS.FLOAT
  if (t === 'char') return TIPOS.CHAR
  if (t === 'bool') return TIPOS.BOOL
  return TIPOS.INT
}

function retornoDesdeCpp(t) {
  return t === 'void' ? RETORNO_VOID : tipoDesdeCpp(t)
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

function leerReturn(cursor) {
  cursor.espacio()
  if (cursor.consumir(';')) return { type: 'devolver', valor: null }
  const valor = leerHasta(cursor, ';').trim()
  cursor.consumir(';')
  return { type: 'devolver', valor: valor || null }
}

function leerLlamada(cursor, ctx, nombre) {
  cursor.consumir('(')
  const argumentos = leerArgumentos(cursor)
  cursor.consumir(';')
  if (!ctx.nombresFunciones.has(nombre)) {
    ctx.avisar(
      `La llamada a "${nombre}" se descartó porque no hay ninguna función con ese nombre en el programa.`,
    )
    return null
  }
  return { type: 'llamar', nombre, argumentos }
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
    if (cursor.eof()) throw new Error('Faltan paréntesis de cierre ")"')
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
    if (cursor.eof()) throw new Error('Faltan paréntesis de cierre ")"')
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
  return args.filter((a) => a !== '')
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
  // Quita el salto final que agrega el generador. Los espacios que lo preceden
  // también se van: de otro modo el formato vuelve con " " en vez de "\n".
  const ultimoParte = partes[partes.length - 1]
  if (ultimoParte && ultimoParte.tipo === 'texto') {
    const recortado = ultimoParte.valor.replace(/ *\n$/, '')
    if (recortado !== ultimoParte.valor) {
      if (recortado === '') partes.pop()
      else ultimoParte.valor = recortado
    }
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
