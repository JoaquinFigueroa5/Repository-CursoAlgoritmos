// ============================================================
// unit4.js — Unidad 4: Ciclos (Cómo repetir)
// ============================================================

import {
  programa,
  nInicio,
  nFin,
  nDeclarar,
  nLeer,
  nMostrar,
  nAsignar,
  nPara,
  nMientras,
  nHacerMientras,
  parteTexto,
  parteExpr,
} from '../../engine/ir.js'

export const unidad4 = {
  id: 'unidad-4',
  numero: 4,
  titulo: 'Ciclos: Cómo repetir',
  corto: 'Ciclos',
  color: 'amber',
  icono: 'Repeat',
  descripcion:
    'La verdadera potencia de los algoritmos aparece al repetir. Aprende los tres ciclos de C++: for, while y do-while, y cuándo usar cada uno.',
  objetivos: [
    'Entender el concepto de ciclo o repetición.',
    'Usar el ciclo for cuando sabemos cuántas veces repetir.',
    'Usar el ciclo while cuando la repetición depende de una condición.',
    'Usar do-while cuando el cuerpo debe ejecutarse al menos una vez.',
    'Combinar acumuladores y contadores dentro de los ciclos.',
  ],
  teoria: [
    {
      tipo: 'parrafo',
      contenido:
        'Repetir es el corazón de la programación. En lugar de escribir 10 veces "Mostrar 1, Mostrar 2...", escribimos una sola instrucción que repite. En C++ hay tres ciclos: **for**, **while** y **do-while**.',
    },
    {
      tipo: 'codigo',
      lenguaje: 'cpp',
      contenido:
        '// for: cuántas veces sé que debo repetir\nfor (int i = 1; i <= 10; i++) {\n    printf("%d\\n", i);\n}',
    },
    {
      tipo: 'parrafo',
      contenido:
        'El `for` se lee así: *inicia el contador en 1; mientras el contador sea menor o igual a 10, sigue; al terminar cada vuelta, suma 1 al contador*. Tiene tres partes separadas por punto y coma: **inicialización**, **condición** y **actualización**.',
    },
    {
      tipo: 'codigo',
      lenguaje: 'cpp',
      contenido:
        '// while: repito mientras la condición sea verdadera\nint contador = 1;\nwhile (contador <= 10) {\n    printf("%d\\n", contador);\n    contador = contador + 1;\n}',
    },
    {
      tipo: 'parrafo',
      contenido:
        'El `while` revisa la condición **antes** de cada vuelta. Si es falsa desde el inicio, el bloque no se ejecuta ni una vez. Dentro del bloque debe cambiar algo (como el contador) o el ciclo sería infinito.',
    },
    {
      tipo: 'codigo',
      lenguaje: 'cpp',
      contenido:
        '// do-while: el cuerpo se ejecuta al menos una vez\nint opcion;\ndo {\n    printf("1. Ver menú\\n2. Salir\\n");\n    scanf("%d", &opcion);\n} while (opcion != 2);',
    },
    {
      tipo: 'nota',
      contenido:
        'Un ciclo **infinito** ocurre cuando la condición nunca se vuelve falsa. Por ejemplo, olvidar aumentar el contador dentro de un while. Tu programa se quedaría repitiendo para siempre.',
    },
    {
      tipo: 'parrafo',
      contenido:
        'Dos patrones muy usados dentro de los ciclos: el **contador** (cuenta cuántas veces pasó algo: `contador = contador + 1`) y el **acumulador** (suma valores: `suma = suma + valor`). El acumulador casi siempre se inicializa en 0 antes del ciclo.',
    },
    {
      tipo: 'tabla',
      encabezados: ['Ciclo', '¿Cuándo usarlo?', '¿Se ejecuta al menos una vez?'],
      filas: [
        ['for', 'Sé exactamente cuántas vueltas (1..N)', 'Sí, si la condición inicial es verdadera'],
        ['while', 'Repito mientras una condición sea verdadera', 'No, si la condición ya es falsa'],
        ['do-while', 'El cuerpo debe correr sí o sí una vez (menús)', 'Sí, siempre'],
      ],
    },
  ],
  ejemplos: [
    {
      titulo: 'Contar del 1 al 10',
      consigna: 'Mostrar los números del 1 al 10, uno por línea.',
      programa: programa([
        nInicio(),
        nDeclarar('i', 'int'),
        nPara('i = 1', 'i <= 10', 'i = i + 1', [nMostrar([parteExpr('i')])]),
        nFin(),
      ]),
    },
    {
      titulo: 'Contar hacia atrás del 10 al 1',
      consigna: 'Mostrar los números del 10 al 1 en orden descendente.',
      programa: programa([
        nInicio(),
        nDeclarar('i', 'int'),
        nPara('i = 10', 'i >= 1', 'i = i - 1', [nMostrar([parteExpr('i')])]),
        nFin(),
      ]),
    },
    {
      titulo: 'Tabla de multiplicar',
      consigna: 'Pedir un número y mostrar su tabla de multiplicar del 1 al 10.',
      programa: programa([
        nInicio(),
        nDeclarar('n', 'int'),
        nDeclarar('i', 'int'),
        nDeclarar('prod', 'int'),
        nLeer(['n']),
        nPara('i = 1', 'i <= 10', 'i = i + 1', [
          nAsignar('prod', 'n * i'),
          nMostrar([parteExpr('n'), parteTexto(' x '), parteExpr('i'), parteTexto(' = '), parteExpr('prod')]),
        ]),
        nFin(),
      ]),
    },
    {
      titulo: 'Suma los primeros N números',
      consigna: 'Pedir N y sumar los números del 1 al N.',
      programa: programa([
        nInicio(),
        nDeclarar('n', 'int'),
        nDeclarar('i', 'int'),
        nDeclarar('suma', 'int', '0'),
        nLeer(['n']),
        nPara('i = 1', 'i <= n', 'i = i + 1', [nAsignar('suma', 'suma + i')]),
        nMostrar([parteTexto('La suma es '), parteExpr('suma')]),
        nFin(),
      ]),
    },
    {
      titulo: 'Leer números hasta el 0 (while)',
      consigna: 'Leer números hasta que se ingrese el 0, contando cuántos se leyeron.',
      programa: programa([
        nInicio(),
        nDeclarar('num', 'int'),
        nDeclarar('contador', 'int', '0'),
        nLeer(['num']),
        nMientras('num != 0', [nAsignar('contador', 'contador + 1'), nLeer(['num'])]),
        nMostrar([parteTexto('Se leyeron '), parteExpr('contador'), parteTexto(' números')]),
        nFin(),
      ]),
    },
    {
      titulo: 'Menú con do-while',
      consigna: 'Mostrar un menú hasta que el usuario elija la opción de salir.',
      programa: programa([
        nInicio(),
        nDeclarar('opcion', 'int'),
        nHacerMientras([nMostrar([parteTexto('1. Ver menú')]), nMostrar([parteTexto('2. Salir')]), nLeer(['opcion'])], 'opcion != 2'),
        nMostrar([parteTexto('Adiós')]),
        nFin(),
      ]),
    },
  ],
  preguntas: [
    {
      pregunta: '¿Qué es un ciclo o bucle?',
      respuesta:
        'Es una estructura que repite un bloque de instrucciones mientras se cumpla una condición. Evita escribir la misma instrucción muchas veces.',
    },
    {
      pregunta: '¿Cuál es la diferencia entre for, while y do-while?',
      respuesta:
        'for se usa cuando se conoce el número de vueltas (tiene contador en su propia cabecera). while repite mientras una condición sea verdadera y puede no ejecutarse nunca. do-while ejecuta el bloque al menos una vez y luego pregunta.',
    },
    {
      pregunta: '¿Qué son las tres partes de la cabecera de un for?',
      respuesta:
        'Inicialización (ej. i = 1), condición (ej. i <= 10) y actualización (ej. i = i + 1). La inicialización corre una vez; la condición se evalúa en cada vuelta y la actualización al final de cada vuelta.',
    },
    {
      pregunta: '¿Qué es un ciclo infinito y cómo se evita?',
      respuesta:
        'Es un ciclo cuya condición nunca se vuelve falsa; el programa no termina. Se evita asegurando que dentro del cuerpo algo cambie hacia que la condición deje de cumplirse (p. ej. aumentar el contador).',
    },
    {
      pregunta: '¿Qué es un acumulador?',
      respuesta:
        'Es una variable que suma o acumula valores en cada vuelta: suma = suma + i. Se inicializa en 0 (o en el elemento neutro) antes de empezar el ciclo.',
    },
    {
      pregunta: '¿Qué es un contador?',
      respuesta:
        'Es una variable que cuenta cuántas veces pasó algo: contador = contador + 1. A diferencia del acumulador, siempre suma la misma cantidad fija (normalmente 1).',
    },
    {
      pregunta: '¿Cuándo conviene usar do-while?',
      respuesta:
        'Cuando el bloque debe ejecutarse al menos una vez sin importar la condición, por ejemplo un menú que debe mostrarse una vez y luego repetirse según la elección del usuario.',
    },
    {
      pregunta: '¿Cómo se representa un ciclo en el diagrama de flujo?',
      respuesta:
        'Con una flecha que vuelve hacia atrás hasta un rombo de decisión (la condición del ciclo). La flecha del "Sí" vuelve al cuerpo y la del "No" sale del ciclo hacia la siguiente instrucción.',
    },
  ],
  reto: {
    titulo: 'El adivinador',
    descripcion:
      'Escribe un algoritmo que lea números hasta que el usuario ingrese el número secreto 7, y que cuente cuántos intentos le llevó. Al final muestra "Adivinaste en N intentos". Usa while o do-while.',
  },
}
