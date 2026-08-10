// ============================================================
// unit1.js — Unidad 1: Salida (Cómo imprimir)
// ============================================================

import {
  programa,
  nInicio,
  nFin,
  nDeclarar,
  nMostrar,
  parteTexto,
  parteExpr,
} from '../../engine/ir.js'

export const unidad1 = {
  id: 'unidad-1',
  numero: 1,
  titulo: 'Salida: Cómo imprimir',
  corto: 'Imprimir',
  color: 'cyan',
  icono: 'Monitor',
  descripcion:
    'Aprende a mostrar mensajes y valores en pantalla usando la función printf de C++ (stdio.h). Es el primer paso de todo algoritmo: comunicar resultados.',
  objetivos: [
    'Entender qué es la salida de un programa.',
    'Identificar la librería stdio.h y la función printf.',
    'Mostrar textos literales y valores de variables.',
    'Usar el salto de línea \\n y otros caracteres especiales.',
    'Ver el mismo algoritmo expresado en las 4 representaciones.',
  ],
  teoria: [
    {
      tipo: 'parrafo',
      contenido:
        'Cuando escribimos un programa, casi siempre queremos que muestre algo al usuario: un mensaje, un resultado, un aviso. A eso se le llama **salida por pantalla**, y en C++ (con la librería stdio.h) lo logramos con la función **printf**.',
    },
    {
      tipo: 'codigo',
      lenguaje: 'cpp',
      contenido:
        '#include <stdio.h>\n\nint main() {\n    printf("Hola mundo\\n");\n    return 0;\n}',
    },
    {
      tipo: 'parrafo',
      contenido:
        'La línea `#include <stdio.h>` carga la biblioteca estándar de entrada y salida, donde vive `printf`. Sin esa línea, el compilador no sabría qué es `printf` y marcaría un error.',
    },
    {
      tipo: 'nota',
      contenido:
        'Todo lo que va entre comillas dobles `"..."` es un texto literal: se muestra tal cual. `printf("Hola")` imprime exactamente Hola.',
    },
    {
      tipo: 'parrafo',
      contenido:
        'El texto `\\n` no es la letra n: es una secuencia especial llamada **salto de línea**. Hace que el cursor baje a la siguiente fila, como al presionar Enter.',
    },
    {
      tipo: 'codigo',
      lenguaje: 'cpp',
      contenido: 'printf("Línea 1\\nLínea 2\\n");\n\n// Salida:\n// Línea 1\n// Línea 2',
    },
    {
      tipo: 'lista',
      titulo: 'Otros caracteres especiales y formatos útiles',
      items: [
        '`\\n` — salto de línea (baja el cursor).',
        '`\\t` — tabulación (espacia horizontalmente).',
        '`\\"` — comilla doble dentro del texto.',
        '`%d` — formato para mostrar un número entero.',
        '`%f` — formato para mostrar un número real (decimal).',
      ],
    },
    {
      tipo: 'parrafo',
      contenido:
        'Cada algoritmo de este curso se puede escribir en **4 formas**: algoritmo en idioma natural, pseudocódigo, diagrama de flujo y código C++. Todas dicen lo mismo; solo cambia la forma de expresarlo. Por ejemplo, “mostrar un mensaje” se dice así en cada una:',
    },
    {
      tipo: 'tabla',
      encabezados: ['Representación', 'Forma de decirlo'],
      filas: [
        ['Algoritmo natural', 'Mostrar "Hola mundo".'],
        ['Pseudocódigo', 'Escribir "Hola mundo"'],
        ['Diagrama de flujo', 'Un paralelogramo de salida con el texto'],
        ['Código C++', 'printf("Hola mundo\\n");'],
      ],
    },
    {
      tipo: 'nota',
      contenido:
        'Para mostrar el valor de una variable usamos un formato como %d: `printf("%d\\n", numero);`. El %d es un “hueco” donde se coloca el número.',
    },
  ],
  ejemplos: [
    {
      titulo: 'Hola mundo',
      consigna: 'Mostrar el texto "Hola mundo" en pantalla.',
      programa: programa([nInicio(), nMostrar([parteTexto('Hola mundo')]), nFin()]),
    },
    {
      titulo: 'Dos mensajes con salto de línea',
      consigna: 'Mostrar dos mensajes, cada uno en una línea diferente.',
      programa: programa([
        nInicio(),
        nMostrar([parteTexto('Bienvenido al curso')]),
        nMostrar([parteTexto('Aprenderás algoritmos')]),
        nFin(),
      ]),
    },
    {
      titulo: 'Mostrar un número',
      consigna: 'Declarar una variable entera con el valor 25 y mostrar su valor.',
      programa: programa([
        nInicio(),
        nDeclarar('edad', 'int', '25'),
        nMostrar([parteTexto('La edad es '), parteExpr('edad')]),
        nFin(),
      ]),
    },
    {
      titulo: 'Mostrar el resultado de una operación',
      consigna: 'Declarar dos números y mostrar el resultado de su suma.',
      programa: programa([
        nInicio(),
        nDeclarar('a', 'int', '5'),
        nDeclarar('b', 'int', '3'),
        nDeclarar('suma', 'int', 'a + b'),
        nMostrar([parteTexto('La suma es '), parteExpr('suma')]),
        nFin(),
      ]),
    },
  ],
  preguntas: [
    {
      pregunta: '¿Qué función cumple printf?',
      respuesta:
        'printf es la función de la librería stdio.h que muestra texto y valores en la pantalla (salida estándar). Entre sus comillas va el mensaje y, si se desea, los formatos %d, %f, etc.',
    },
    {
      pregunta: '¿Qué es la librería stdio.h y por qué la necesitamos?',
      respuesta:
        'Es la biblioteca estándar de entrada y salida de C/C++. Contiene las definiciones de printf (salida) y scanf (entrada). Se incluye con la línea #include <stdio.h>. Sin ella, el compilador no reconoce a printf ni a scanf.',
    },
    {
      pregunta: '¿Qué significan las comillas dobles en "Hola mundo"?',
      respuesta:
        'Las comillas dobles delimitan un texto literal: una secuencia de caracteres que se mostrará tal cual. Todo lo que esté entre comillas es texto, no código.',
    },
    {
      pregunta: '¿Qué hace \\n dentro de un printf?',
      respuesta:
        '\\n es una secuencia de escape que produce un salto de línea: el cursor baja a la siguiente fila. Es como presionar Enter dentro del texto mostrado.',
    },
    {
      pregunta: '¿Qué diferencia hay entre mostrar "5" y mostrar 5?',
      respuesta:
        '"5" es un texto literal: se imprime el carácter 5 tal cual. Sin comillas, 5 es un número: se puede usar en operaciones. En pantalla ambos pueden verse igual, pero en el programa uno es texto y el otro es un valor numérico.',
    },
    {
      pregunta: '¿Qué pasaría si olvidamos el punto y coma (;) al final de printf?',
      respuesta:
        'El compilador marcaría un error de sintaxis porque en C++ cada instrucción debe terminar en ;. Es una de las primeras causas de errores al aprender C++.',
    },
    {
      pregunta: '¿Qué significa %d en printf?',
      respuesta:
        '%d es el formato o especificador para un número entero. Indica el tipo de valor que se mostrará en esa posición: printf("%d", 7) imprime 7. Para reales se usa %f y para caracteres %c.',
    },
    {
      pregunta: '¿Se puede mostrar el valor de una variable sin usar un formato?',
      respuesta:
        'No directamente. En printf, para mostrar el valor de una variable debes usar un formato (%d, %f, %c...) y pasar la variable entre los argumentos, separada por coma: printf("El valor es %d\\n", edad);.',
    },
  ],
  reto: {
    titulo: 'Tu primer cartel',
    descripcion:
      'Escribe un algoritmo que muestre tu nombre, tu edad y tu ciudad, cada dato en una línea. Pruébalo en las 4 representaciones y ejecuta el C++ en el laboratorio.',
  },
}
