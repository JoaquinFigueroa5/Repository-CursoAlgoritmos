import {
  programa,
  nInicio, nFin, nDeclarar, nMostrar, nLeer, nAsignar, nSi, nPara, nMientras, nHacerMientras,
  parteTexto, parteExpr,
} from '../src/engine/ir.js'
import { cppDesdePrograma, irDesdeCPP } from '../src/engine/cpp.js'
import { pseudoDesdePrograma, irDesdePseudo } from '../src/engine/pseudocode.js'
import { naturalDesdePrograma, irDesdeNatural } from '../src/engine/natural.js'
import { flujoDesdePrograma, programaDesdeFlujo } from '../src/engine/flowchart.js'

let fallos = 0
function eq(a, b) {
  if (a === b) return true
  if (typeof a !== typeof b) return false
  if (a === null || b === null) return a === b
  if (typeof a !== 'object') return a === b
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false
    return a.every((x, i) => eq(x, b[i]))
  }
  const ka = Object.keys(a)
  const kb = Object.keys(b)
  if (ka.length !== kb.length) return false
  return ka.every((k) => eq(a[k], b[k]))
}

function verificar(program, nombre) {
  const reps = {
    cpp: { gen: cppDesdePrograma, parse: irDesdeCPP },
    pseudo: { gen: pseudoDesdePrograma, parse: irDesdePseudo },
    natural: { gen: naturalDesdePrograma, parse: irDesdeNatural },
  }
  let flujo = null
  try {
    flujo = flujoDesdePrograma(program)
  } catch (e) {
    console.log(`✗ [${nombre}] flujo gen falló: ${e.message}`)
    fallos++
    return
  }

  const original = JSON.stringify(program.pasos)
  for (const [k, r] of Object.entries(reps)) {
    let texto
    try {
      texto = r.gen(program)
    } catch (e) {
      console.log(`✗ [${nombre}] ${k} gen falló: ${e.message}`)
      fallos++
      continue
    }
    const res = r.parse(texto)
    if (!res.ok) {
      console.log(`✗ [${nombre}] ${k} parse falló: ${res.error}\n---\n${texto}`)
      fallos++
      continue
    }
    if (!eq(res.programa.pasos, program.pasos)) {
      console.log(`✗ [${nombre}] ${k} round-trip difiere\n---\n${texto}\n--- esperado:\n${original}\n--- obtenido:\n${JSON.stringify(res.programa.pasos)}`)
      fallos++
      continue
    }
    console.log(`✓ [${nombre}] ${k}`)
  }

  // flujo -> IR
  const resF = programaDesdeFlujo(flujo.nodes, flujo.edges)
  if (!resF.ok) {
    console.log(`✗ [${nombre}] flujo parse falló: ${resF.error}`)
    fallos++
  } else if (!eq(resF.programa.pasos, program.pasos)) {
    console.log(`✗ [${nombre}] flujo round-trip difiere\n--- esperado:\n${original}\n--- obtenido:\n${JSON.stringify(resF.programa.pasos)}`)
    fallos++
  } else {
    console.log(`✓ [${nombre}] flujo`)
  }
}

// ---------- programas de prueba ----------

verificar(
  programa([
    nInicio(),
    nMostrar([parteTexto('Hola mundo')]),
    nFin(),
  ]),
  'hola mundo',
)

verificar(
  programa([
    nInicio(),
    nDeclarar('a', 'int'),
    nMostrar([parteTexto('Ingresa un número: ')]),
    nLeer(['a']),
    nMostrar([parteTexto('El número es '), parteExpr('a')]),
    nFin(),
  ]),
  'leer y mostrar',
)

verificar(
  programa([
    nInicio(),
    nDeclarar('n', 'int'),
    nLeer(['n']),
    nSi('n > 0', [nMostrar([parteTexto('Positivo')])], [nMostrar([parteTexto('Negativo')])]),
    nFin(),
  ]),
  'si con sino',
)

verificar(
  programa([
    nInicio(),
    nDeclarar('i', 'int'),
    nPara('i = 1', 'i <= 10', 'i = i + 1', [nMostrar([parteExpr('i')])]),
    nFin(),
  ]),
  'para del 1 al 10',
)

verificar(
  programa([
    nInicio(),
    nDeclarar('n', 'int'),
    nDeclarar('contador', 'int'),
    nLeer(['n']),
    nMientras('contador <= n', [nMostrar([parteExpr('contador')]), nAsignar('contador', 'contador + 1')]),
    nFin(),
  ]),
  'mientras',
)

verificar(
  programa([
    nInicio(),
    nDeclarar('op', 'int'),
    nHacerMientras([nMostrar([parteTexto('Menú')]), nLeer(['op'])], 'op != 3'),
    nFin(),
  ]),
  'hacer mientras (menú)',
)

verificar(
  programa([
    nInicio(),
    nDeclarar('n', 'int'),
    nLeer(['n']),
    nSi('n > 0', [
      nMostrar([parteTexto('Es positivo')]),
      nPara('i = 1', 'i <= n', 'i = i + 1', [nMostrar([parteExpr('i')])]),
    ], [
      nMostrar([parteTexto('No es positivo')]),
    ]),
    nFin(),
  ]),
  'si con para anidado',
)

verificar(
  programa([
    nInicio(),
    nDeclarar('a', 'int'),
    nDeclarar('b', 'int'),
    nLeer(['a', 'b']),
    nSi('a > b', [nMostrar([parteTexto('A mayor')])], [
      nSi('a < b', [nMostrar([parteTexto('B mayor')])], [nMostrar([parteTexto('Iguales')])]),
    ]),
    nFin(),
  ]),
  'si anidado',
)

verificar(
  programa([
    nInicio(),
    nDeclarar('n', 'int'),
    nDeclarar('suma', 'int'),
    nLeer(['n']),
    nPara('i = 1', 'i <= n', 'i = i + 1', [nAsignar('suma', 'suma + i')]),
    nMostrar([parteTexto('La suma es '), parteExpr('suma')]),
    nFin(),
  ]),
  'acumulador con para',
)

console.log(fallos === 0 ? '\nTODOS LOS TESTS PASARON' : `\n${fallos} TEST(S) FALLARON`)
process.exit(fallos === 0 ? 0 : 1)
