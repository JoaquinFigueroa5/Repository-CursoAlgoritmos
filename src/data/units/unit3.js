// ============================================================
// unit3.js — Unidad 3: Condicionales (Cómo tomar decisiones)
// ============================================================

import {
  programa,
  nInicio,
  nFin,
  nDeclarar,
  nLeer,
  nMostrar,
  nSi,
  parteTexto,
} from '../../engine/ir.js'

export const unidad3 = {
  id: 'unidad-3',
  numero: 3,
  titulo: 'Condicionales: Cómo tomar decisiones',
  corto: 'Condicionales',
  color: 'green',
  icono: 'GitBranch',
  descripcion:
    'Los algoritmos no son lineales: a veces deben decidir. Aprende a usar el condicional Si/if-else para ejecutar un bloque u otro según una condición.',
  objetivos: [
    'Entender qué es una condición (expresión booleana).',
    'Usar los operadores de comparación <, >, ==, !=, <=, >=.',
    'Estructurar un if-else con sus llaves.',
    'Anidar condicionales para casos múltiples.',
    'Dibujar la decisión con el rombo en el diagrama de flujo.',
  ],
  teoria: [
    {
      tipo: 'parrafo',
      contenido:
        'Muchos algoritmos necesitan **elegir entre dos caminos** según un dato. En C++ esa elección se hace con `if` (si) y, opcionalmente, `else` (si no).',
    },
    {
      tipo: 'codigo',
      lenguaje: 'cpp',
      contenido:
        '#include <stdio.h>\n\nint main() {\n    int num;\n    printf("Dame un número: ");\n    scanf("%d", &num);\n\n    if (num > 0) {\n        printf("Es positivo\\n");\n    } else {\n        printf("Es negativo o cero\\n");\n    }\n    return 0;\n}',
    },
    {
      tipo: 'parrafo',
      contenido:
        'La **condición** va entre paréntesis después del `if`. Es una comparación que da verdadero (true) o falso (false). Si es verdadera, se ejecuta el primer bloque entre llaves `{}`; si es falsa, el bloque del `else`.',
    },
    {
      tipo: 'tabla',
      encabezados: ['Operador', 'Significado', 'Ejemplo'],
      filas: [
        ['>', 'mayor que', 'num > 0'],
        ['<', 'menor que', 'edad < 18'],
        ['>=', 'mayor o igual que', 'nota >= 6'],
        ['<=', 'menor o igual que', 'temp <= 0'],
        ['==', 'igual a', 'letra == \'a\''],
        ['!=', 'distinto de', 'opcion != 3'],
      ],
    },
    {
      tipo: 'nota',
      contenido:
        'Cuidado: `=` asigna un valor (edad = 18) y `==` compara (edad == 18). Confundirlos es uno de los errores clásicos de C++. La condición SIEMPRE usa `==`, `!=`, `<`, `>`, `<=`, `>=`.',
    },
    {
      tipo: 'parrafo',
      contenido:
        'El **diagrama de flujo** dibuja una decisión como un rombo. Del rombo salen dos flechas: una para el caso verdadero (Sí) y otra para el falso (No). Cada flecha lleva a la instrucción que corresponde.',
    },
    {
      tipo: 'parrafo',
      contenido:
        'Cuando hay más de dos opciones se pueden **anidar** condicionales: dentro del `else` se coloca otro `if`. Así puedes resolver casos como: mayor que / menor que / igual a.',
    },
    {
      tipo: 'codigo',
      lenguaje: 'cpp',
      contenido:
        'if (a > b) {\n    printf("El mayor es A\\n");\n} else if (a < b) {\n    printf("El mayor es B\\n");\n} else {\n    printf("Son iguales\\n");\n}',
    },
  ],
  ejemplos: [
    {
      titulo: 'Positivo o negativo',
      consigna: 'Pedir un número y decir si es positivo, negativo o cero.',
      programa: programa([
        nInicio(),
        nDeclarar('num', 'int'),
        nLeer(['num']),
        nSi('num > 0', [nMostrar([parteTexto('Es positivo')])], [nSi('num < 0', [nMostrar([parteTexto('Es negativo')])], [nMostrar([parteTexto('Es cero')])])]),
        nFin(),
      ]),
    },
    {
      titulo: 'Mayor de dos números',
      consigna: 'Pedir dos números y mostrar cuál es mayor, o si son iguales.',
      programa: programa([
        nInicio(),
        nDeclarar('a', 'int'),
        nDeclarar('b', 'int'),
        nLeer(['a']),
        nLeer(['b']),
        nSi('a > b', [nMostrar([parteTexto('El mayor es A')])], [nSi('a < b', [nMostrar([parteTexto('El mayor es B')])], [nMostrar([parteTexto('Son iguales')])])]),
        nFin(),
      ]),
    },
    {
      titulo: 'Es mayor de edad',
      consigna: 'Pedir la edad y mostrar si es mayor de edad (18 o más).',
      programa: programa([
        nInicio(),
        nDeclarar('edad', 'int'),
        nLeer(['edad']),
        nSi('edad >= 18', [nMostrar([parteTexto('Es mayor de edad')])], [nMostrar([parteTexto('Es menor de edad')])]),
        nFin(),
      ]),
    },
    {
      titulo: 'Par o impar',
      consigna: 'Pedir un número y mostrar si es par o impar.',
      programa: programa([
        nInicio(),
        nDeclarar('num', 'int'),
        nLeer(['num']),
        nSi('num % 2 == 0', [nMostrar([parteTexto('Es par')])], [nMostrar([parteTexto('Es impar')])]),
        nFin(),
      ]),
    },
    {
      titulo: 'Aprobado o reprobado',
      consigna: 'Pedir una nota del 0 al 10 y mostrar si aprueba (6 o más).',
      programa: programa([
        nInicio(),
        nDeclarar('nota', 'float'),
        nLeer(['nota']),
        nSi('nota >= 6', [nMostrar([parteTexto('Aprobado')])], [nMostrar([parteTexto('Reprobado')])]),
        nFin(),
      ]),
    },
  ],
  preguntas: [
    {
      pregunta: '¿Qué es una condición en un algoritmo?',
      respuesta:
        'Es una expresión que se evalúa como verdadera o falsa, por ejemplo num > 0. Decide cuál de los dos caminos del if-else se ejecuta.',
    },
    {
      pregunta: '¿Qué diferencia hay entre if, else if y else?',
      respuesta:
        'if ejecuta su bloque si la condición es verdadera. else ejecuta su bloque cuando la condición del if fue falsa. else if encadena: se evalúa solo si la anterior fue falsa, permitiendo varios casos.',
    },
    {
      pregunta: '¿Por qué se usan llaves {} en if y else?',
      respuesta:
        'Las llaves agrupan un bloque de varias instrucciones que se ejecutan juntas. Sin llaves, el if solo controla la instrucción inmediatamente siguiente.',
    },
    {
      pregunta: '¿Qué significa num % 2 == 0?',
      respuesta:
        'Es la condición de paridad: % calcula el resto de dividir num entre 2. Si el resto es 0, num es par; si es 1, es impar.',
    },
    {
      pregunta: '¿En qué se diferencia = de ==?',
      respuesta:
        '= es la asignación: guarda un valor en una variable (x = 5). == es la comparación: pregunta si dos valores son iguales (x == 5). En las condiciones siempre se usa ==.',
    },
    {
      pregunta: '¿Cómo se dibuja una decisión en un diagrama de flujo?',
      respuesta:
        'Con un rombo que contiene la condición. De él salen dos flechas etiquetadas: una con Sí (verdadero) y otra con No (falso), cada una hacia la instrucción correspondiente.',
    },
    {
      pregunta: '¿Puede un if no tener else?',
      respuesta:
        'Sí. Si la condición es falsa y no hay else, simplemente no se ejecuta nada y el programa continúa. El else es opcional.',
    },
    {
      pregunta: '¿Qué son los condicionales anidados?',
      respuesta:
        'Son if/else colocados dentro de otros if/else, como las matrioskas. Sirven para manejar varias opciones: primero se pregunta por el mayor, y dentro del else se vuelve a preguntar.',
    },
  ],
  reto: {
    titulo: 'Clasificador de números',
    descripcion:
      'Pide un número y clasifícalo así: positivo par, positivo impar, negativo o cero. Usa condicionales anidados y dibuja el diagrama completo con el rombo.',
  },
}
