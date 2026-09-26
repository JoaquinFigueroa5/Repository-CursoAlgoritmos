import {
  programa,
  nInicio, nFin, nDeclarar, nMostrar, nLeer, nAsignar, nSi, nPara, nMientras, nHacerMientras,
  nSwitch, nBreak, nContinuar, nFuncion, nDevolver, nLlamar, parametro,
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

verificar(
  programa([
    nInicio(),
    nDeclarar('i', 'int'),
    nPara('i = 10', 'i >= 1', 'i = i - 1', [nMostrar([parteExpr('i')])]),
    nFin(),
  ]),
  'para descendente',
)

verificar(
  programa([
    nInicio(),
    nDeclarar('suma', 'int', '0'),
    nMostrar([parteExpr('suma')]),
    nFin(),
  ]),
  'declarar con valor',
)

verificar(
  programa([
    nInicio(),
    nDeclarar('num', 'int'),
    nLeer(['num']),
    nSi('num % 2 == 0', [nMostrar([parteTexto('Par')])], [nMostrar([parteTexto('Impar')])]),
    nFin(),
  ]),
  'si con módulo',
)

verificar(
  programa([
    nInicio(),
    nDeclarar('x', 'int'),
    nLeer(['x']),
    nSi('x > 0 && x < 10', [nMostrar([parteTexto('Entre 1 y 9')])]),
    nFin(),
  ]),
  'condición compuesta',
)

verificar(
  programa([
    nInicio(),
    nDeclarar('nombre', 'string'),
    nMostrar([parteTexto('Ingresa tu nombre: ')]),
    nLeer(['nombre']),
    nMostrar([parteTexto('Hola '), parteExpr('nombre')]),
    nFin(),
  ]),
  'cadena en C++',
)

verificar(
  programa([
    nInicio(),
    nDeclarar('op', 'int'),
    nLeer(['op']),
    nSwitch('op', [
      { valor: '1', pasos: [nMostrar([parteTexto('Uno')])] },
      { valor: '2', pasos: [nMostrar([parteTexto('Dos')])] },
      { valor: '3', pasos: [nMostrar([parteTexto('Tres')])] },
    ], [nMostrar([parteTexto('Otro')])]),
    nFin(),
  ]),
  'según con casos',
)

verificar(
  programa([
    nInicio(),
    nDeclarar('op', 'int'),
    nLeer(['op']),
    nSwitch('op', [
      { valor: '1', pasos: [nMostrar([parteTexto('Uno')]), nBreak()] },
      { valor: '2', pasos: [nMostrar([parteTexto('Dos')]), nBreak()] },
    ], [nMostrar([parteTexto('Otro')])]),
    nFin(),
  ]),
  'según con break',
)

verificar(
  programa([
    nInicio(),
    nDeclarar('i', 'int'),
    nPara('i = 1', 'i <= 10', 'i = i + 1', [
      nSi('i == 5', [nBreak()], [nContinuar()]),
    ]),
    nFin(),
  ]),
  'break y continue en ciclo',
)

// ---------- funciones, procedimientos y llamadas ----------

verificar(
  programa([
    nInicio(),
    nFuncion('esPrimo', 'bool', [parametro('n', 'int')], [
      nPara('i = 2', 'i * i <= n', 'i = i + 1', [
        nSi('n % i == 0', [nDevolver('false')], []),
      ]),
      nDevolver('true'),
    ]),
    nDeclarar('num', 'int'),
    nLeer(['num']),
    nSi('esPrimo(num) == 1', [
      nMostrar([parteTexto('Es primo')]),
    ], [
      nMostrar([parteTexto('No es primo')]),
    ]),
    nFin(),
  ]),
  'función booleana llamada desde una condición',
)

verificar(
  programa([
    nInicio(),
    nFuncion('intercambiar', 'void', [parametro('a', 'int', true), parametro('b', 'int', true)], [
      nDeclarar('temp', 'int'),
      nAsignar('temp', 'a'),
      nAsignar('a', 'b'),
      nAsignar('b', 'temp'),
    ]),
    nDeclarar('x', 'int', '5'),
    nDeclarar('y', 'int', '7'),
    nLlamar('intercambiar', ['x', 'y']),
    nFin(),
  ]),
  'procedimiento con parámetros por referencia',
)

verificar(
  programa([
    nInicio(),
    nFuncion('esPrimo', 'bool', [parametro('n', 'int')], [
      nPara('i = 2', 'i * i <= n', 'i = i + 1', [
        nSi('n % i == 0', [nDevolver('false')], []),
      ]),
      nDevolver('true'),
    ]),
    nFuncion('mostrarResultado', 'void', [parametro('n', 'int'), parametro('esPrimo', 'bool')], [
      nSi('n <= 1', [
        nMostrar([parteTexto('El '), parteExpr('n'), parteTexto(' no es ni primo ni compuesto.')]),
      ], [
        nSi('esPrimo == 1', [
          nMostrar([parteTexto('El numero ingresado es primo.')]),
        ], [
          nMostrar([parteTexto('El numero ingresado NO es primo.')]),
        ]),
      ]),
    ]),
    nFuncion('intercambiar', 'void', [parametro('a', 'int', true), parametro('b', 'int', true)], [
      nDeclarar('temp', 'int'),
      nAsignar('temp', 'a'),
      nAsignar('a', 'b'),
      nAsignar('b', 'temp'),
    ]),
    nDeclarar('num', 'int'),
    nDeclarar('a', 'int', '5'),
    nDeclarar('b', 'int', '7'),
    nMostrar([parteTexto('Ingrese su numero para determinar si es primo o no:')]),
    nLeer(['num']),
    nLlamar('mostrarResultado', ['num', 'esPrimo(num)']),
    nMostrar([parteTexto('Numeros sin reemplazar: \n a) '), parteExpr('a'), parteTexto(' \n b) '), parteExpr('b'), parteTexto(' ')]),
    nLlamar('intercambiar', ['a', 'b']),
    nMostrar([parteTexto('Numeros reemplazados: \n a) '), parteExpr('a'), parteTexto(' \n b) '), parteExpr('b'), parteTexto(' ')]),
    nFin(),
  ]),
  'esPrimo / mostrarResultado / intercambiar (programa completo)',
)

// Varias variables declaradas en una sola línea de C++.
{
  const src = `int main() {
    int num, a = 5, b = 7;
    mostrar(a, b);
}`
  const r = irDesdeCPP(src)
  const esperado = {
    num: null,
    a: '5',
    b: '7',
  }
  const obtenido = Object.fromEntries(
    (r.ok ? r.programa.pasos : [])
      .filter((p) => p.type === 'declarar')
      .map((p) => [p.nombre, p.valor]),
  )
  if (!r.ok || JSON.stringify(obtenido) !== JSON.stringify(esperado)) {
    console.log(`✗ [varias variables en una declaración] ${r.error ?? JSON.stringify(obtenido)}`)
    fallos++
  } else {
    console.log('✓ [varias variables en una declaración]')
  }
}

// Una llamada a una función que no existe se descarta con aviso, no en silencio.
{
  const r = irDesdeCPP(`int main() {\n  noExiste(1);\n  int a = 1;\n}`)
  if (r.ok && r.avisos.length === 0) {
    console.log('✗ [aviso por llamada desconocida] no se generó aviso')
    fallos++
  } else if (r.ok && r.programa.pasos.length !== 3) {
    console.log(`✗ [aviso por llamada desconocida] pasos inesperados: ${JSON.stringify(r.programa.pasos)}`)
    fallos++
  } else {
    console.log('✓ [aviso por llamada desconocida]')
  }
}

// ---------------- diagramas con funciones desplegadas ----------------

function check(nombre, condicion, detalle = '') {
  if (condicion) {
    console.log(`✓ [${nombre}]`)
  } else {
    console.log(`✗ [${nombre}] ${detalle}`)
    fallos++
  }
}

// Ida y vuelta por el diagrama exigiendo que el IR vuelva idéntico.
function verificarFlujoExacto(program, nombre) {
  let flujo
  try {
    flujo = flujoDesdePrograma(program)
  } catch (e) {
    check(nombre, false, `el diagrama no se pudo generar: ${e.message}`)
    return
  }
  const r = programaDesdeFlujo(flujo.nodes, flujo.edges)
  if (!r.ok) {
    check(nombre, false, r.error)
    return
  }
  check(nombre, eq(r.programa, program), `el IR volvió distinto\n     ${JSON.stringify(r.programa)}`)
}

// Cada función del IR se dibuja completa: cabecera, cuerpo y "Fin Funcion".
{
  const prog = programa([
    nInicio(),
    nFuncion('vacia', 'void', [], []),
    nFuncion('corta', 'int', [], [nDevolver('1')]),
    nFin(),
  ])
  const { nodes } = flujoDesdePrograma(prog)
  const de = (t) => nodes.filter((n) => n.type === t)
  check(
    'diagrama: una cabecera y un fin por función',
    de('subprograma').length === 2 && de('finFuncion').length === 2,
    `subprograma=${de('subprograma').length} finFuncion=${de('finFuncion').length}`,
  )
  const cabecera = de('subprograma').map((n) => n.data.funcion.nombre).sort()
  check(
    'diagrama: la cabecera conserva la firma',
    eq(cabecera, ['corta', 'vacia']),
    JSON.stringify(cabecera),
  )
  const cuerpo = de('devolver')
  check(
    'diagrama: el cuerpo de la función se dibuja',
    cuerpo.length === 1 && cuerpo[0].data.label.includes('1'),
    JSON.stringify(cuerpo.map((n) => n.data.label)),
  )
  const flujo = flujoDesdePrograma(prog)
  const aristas = flujo.edges
  const fines = new Set(de('finFuncion').map((n) => n.id))
  const ids = new Set(nodes.map((n) => n.id))
  const alcanzaFin = (origen) => {
    const pila = [origen]
    const visto = new Set()
    while (pila.length) {
      const u = pila.pop()
      if (fines.has(u)) return true
      if (visto.has(u)) continue
      visto.add(u)
      for (const e of aristas.filter((x) => x.source === u)) pila.push(e.target)
    }
    return false
  }
  check(
    'diagrama: cada función llega desde su cabecera hasta su fin',
    de('subprograma').every((n) => alcanzaFin(n.id)),
  )
  check(
    'diagrama: no quedan aristas desde nodos inexistentes',
    aristas.every((e) => ids.has(e.source) && ids.has(e.target)),
    JSON.stringify(aristas.filter((e) => !ids.has(e.source) || !ids.has(e.target)).map((e) => e.source)),
  )
}

verificarFlujoExacto(
  programa([
    nInicio(),
    nFuncion('pr', 'int', [], [
      nDeclarar('i', 'int', '0'),
      nMientras('i < 5', [nAsignar('i', 'i + 1'), nSi('i == 3', [nDevolver('i')], [])]),
      nDevolver('0'),
    ]),
    nFin(),
  ]),
  'diagrama: si con devolver dentro de un mientras',
)

verificarFlujoExacto(
  programa([
    nInicio(),
    nFuncion('pr', 'int', [], [
      nDeclarar('i', 'int', '0'),
      nHacerMientras([nAsignar('i', 'i + 1'), nSi('i == 3', [nDevolver('i')], [])], 'i < 5'),
      nDevolver('0'),
    ]),
    nFin(),
  ]),
  'diagrama: si con devolver dentro de un hacer mientras',
)

verificarFlujoExacto(
  programa([
    nInicio(),
    nFuncion('pr', 'int', [], [
      nSwitch('op', [
        { valor: '1', pasos: [nDevolver('1')] },
        { valor: '2', pasos: [nDeclarar('x', 'int', '5'), nAsignar('x', 'x * 2'), nDevolver('x')] },
      ]),
    ]),
    nFin(),
  ]),
  'diagrama: todos los casos del según devuelven',
)

verificarFlujoExacto(
  programa([
    nInicio(),
    nFuncion('pr', 'int', [], [
      nSwitch('op', [
        { valor: '1', pasos: [nAsignar('a', '1')] },
        { valor: '2', pasos: [nDevolver('9')] },
        { valor: '3', pasos: [nAsignar('b', '3')] },
      ], [nAsignar('c', '0')]),
      nAsignar('d', '4'),
    ]),
    nFin(),
  ]),
  'diagrama: un caso del según devuelve y los demás continúan',
)

verificarFlujoExacto(
  programa([
    nInicio(),
    nFuncion('pr', 'int', [], [
      nSi('a > 0', [nDevolver('1')], [nDevolver('0')]),
    ]),
    nFin(),
  ]),
  'diagrama: las dos ramas del si devuelven',
)

verificarFlujoExacto(
  programa([
    nInicio(),
    nFuncion('pr', 'int', [], [nAsignar('r', '1'), nDevolver('r')]),
    nFuncion('v', 'void', [], []),
    nFin(),
  ]),
  'diagrama: cuerpo que termina en devolver y función vacía',
)

// Un `Si` cuya rama devuelve followed de más código se dibuja con la continuación
// como rama "No": el diagrama no puede expresar un `Sino` vacío, así que la ida y
// vuelta lo normaliza. El comportamiento es equivalente, no un error.
{
  const original = programa([
    nInicio(),
    nFuncion('pr', 'void', [], [
      nPara('i = 0', 'i < 5', 'i = i + 1', [
        nSi('i == 2', [nDevolver('0')], []),
        nAsignar('x', '1'),
      ]),
    ]),
    nFin(),
  ])
  const esperado = programa([
    nInicio(),
    nFuncion('pr', 'void', [], [
      nPara('i = 0', 'i < 5', 'i = i + 1', [
        nSi('i == 2', [nDevolver('0')], [nAsignar('x', '1')]),
      ]),
    ]),
    nFin(),
  ])
  const { nodes, edges } = flujoDesdePrograma(original)
  const r = programaDesdeFlujo(nodes, edges)
  check(
    'diagrama: la continuación de un si con devolver queda en su rama "No"',
    r.ok && eq(r.programa, esperado),
    r.ok ? JSON.stringify(r.programa) : r.error,
  )
}

// El programa completo en C++ (con `i++`, referencias y varias funciones) tiene que
// volver idéntico pasando por el diagrama.
{
  const src = `#include <cstdio>

bool esPrimo(int n) {
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) {
            return false;
        }
    }
    return true;
}

void mostrarResultado(int n, bool primo) {
    if (n <= 1) {
        printf("El %d no es ni primo ni compuesto.\\n", n);
    } else {
        if (primo == true) {
            printf("Es primo.\\n");
        } else {
            printf("No es primo.\\n");
        }
    }
}

void intercambiar(int &a, int &b) {
    int temp;
    temp = a;
    a = b;
    b = temp;
}

int main() {
    int num, a = 5, b = 7;
    scanf("%d", &num);
    mostrarResultado(num, esPrimo(num));
    intercambiar(a, b);
    return 0;
}`
  const r = irDesdeCPP(src)
  if (!r.ok) {
    check('cpp completo: ida y vuelta por el diagrama', false, r.error)
  } else {
    const flujo = flujoDesdePrograma(r.programa)
    const tipos = flujo.nodes.reduce((acc, n) => ({ ...acc, [n.type]: (acc[n.type] ?? 0) + 1 }), {})
    check(
      'cpp completo: el diagrama dibuja las tres funciones con su cuerpo',
      tipos.subprograma === 3 && tipos.finFuncion === 3 && tipos.devolver === 2,
      JSON.stringify(tipos),
    )
    const vuelta = programaDesdeFlujo(flujo.nodes, flujo.edges)
    check(
      'cpp completo: ida y vuelta por el diagrama',
      vuelta.ok && eq(vuelta.programa, r.programa),
      vuelta.ok ? JSON.stringify(vuelta.programa) : vuelta.error,
    )
    check('cpp completo: sin avisos', r.avisos.length === 0, JSON.stringify(r.avisos))
  }
}

console.log(fallos === 0 ? '\nTODOS LOS TESTS PASARON' : `\n${fallos} TEST(S) FALLARON`)
process.exit(fallos === 0 ? 0 : 1)
