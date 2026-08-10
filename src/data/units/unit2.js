// ============================================================
// unit2.js — Unidad 2: Entrada (Cómo pedir datos) y variables
// ============================================================

import {
  programa,
  nInicio,
  nFin,
  nDeclarar,
  nLeer,
  nMostrar,
  nAsignar,
  parteTexto,
  parteExpr,
} from '../../engine/ir.js'

export const unidad2 = {
  id: 'unidad-2',
  numero: 2,
  titulo: 'Entrada: Cómo pedir datos',
  corto: 'Entrada',
  color: 'magenta',
  icono: 'Keyboard',
  descripcion:
    'Los programas útiles no solo muestran información: también la piden. Aprende a declarar variables y a leer valores del teclado con scanf.',
  objetivos: [
    'Comprender qué es la entrada estándar (el teclado).',
    'Declarar variables de distintos tipos de datos.',
    'Pedir datos al usuario con scanf.',
    'Almacenar lo leído en variables y usarlas después.',
    'Expresar entrada + salida en las 4 representaciones.',
  ],
  teoria: [
    {
      tipo: 'parrafo',
      contenido:
        'Una vez que sabes mostrar información, el siguiente paso es **pedir datos al usuario**. En C++ usamos `scanf` para leer desde el teclado y guardar lo leído en variables.',
    },
    {
      tipo: 'codigo',
      lenguaje: 'cpp',
      contenido:
        '#include <stdio.h>\n\nint main() {\n    int edad;\n    printf("¿Cuántos años tienes? ");\n    scanf("%d", &edad);\n    printf("Tienes %d años\\n", edad);\n    return 0;\n}',
    },
    {
      tipo: 'parrafo',
      contenido:
        'Antes de guardar un dato necesitas una **variable**: una caja con nombre que puede guardar un valor. En C++ se declara indicando primero su tipo y luego su nombre: `int edad;` declara una variable entera llamada edad.',
    },
    {
      tipo: 'tabla',
      encabezados: ['Tipo', 'Sirve para', 'Formato'],
      filas: [
        ['int', 'Números enteros (5, -3, 100)', '%d'],
        ['float', 'Números reales (3.14, 2.5)', '%f'],
        ['char', 'Un solo carácter (\'a\')', '%c'],
      ],
    },
    {
      tipo: 'nota',
      contenido:
        'En scanf la variable va precedida por un ampersand `&`: `scanf("%d", &edad);`. El & le indica a la función en qué dirección guardar el valor. No es necesario entender los punteros todavía: solo recuerda el ampersand en scanf.',
    },
    {
      tipo: 'parrafo',
      contenido:
        'Un mismo problema puede tener partes fijas (mensajes) y partes variables (lo que pide el usuario). El patrón clásico es: **pedir → leer → procesar → mostrar**. Ese es exactamente el esqueleto de los próximos ejercicios.',
    },
    {
      tipo: 'lista',
      titulo: 'Pasos para leer un dato con scanf',
      items: [
        'Declarar la variable con su tipo: `int num;`',
        'Mostrar un mensaje que pida el dato: `printf("Ingresa un número: ");`',
        'Leer con su formato y el &: `scanf("%d", &num);`',
        'Usar la variable en lo que sigue del programa.',
      ],
    },
    {
      tipo: 'parrafo',
      contenido:
        'En lenguaje natural, "pedir un dato" se dice **Leer**. En pseudocódigo también **Leer**. En el diagrama de flujo se dibuja un paralelogramo de entrada. Todas significan lo mismo: tomar un valor del teclado y guardarlo.',
    },
  ],
  ejemplos: [
    {
      titulo: 'Suma de dos números',
      consigna: 'Pedir dos números al usuario y mostrar su suma.',
      programa: programa([
        nInicio(),
        nDeclarar('a', 'int'),
        nDeclarar('b', 'int'),
        nDeclarar('suma', 'int'),
        nLeer(['a']),
        nLeer(['b']),
        nAsignar('suma', 'a + b'),
        nMostrar([parteTexto('La suma es '), parteExpr('suma')]),
        nFin(),
      ]),
    },
    {
      titulo: 'Edad y mensaje personalizado',
      consigna: 'Pedir el nombre (con getchar) y la edad, y saludar con ambos.',
      programa: programa([
        nInicio(),
        nDeclarar('edad', 'int'),
        nLeer(['edad']),
        nMostrar([parteTexto('Tienes '), parteExpr('edad'), parteTexto(' años')]),
        nFin(),
      ]),
    },
    {
      titulo: 'Promedio de dos notas',
      consigna: 'Pedir dos notas y mostrar su promedio.',
      programa: programa([
        nInicio(),
        nDeclarar('nota1', 'float'),
        nDeclarar('nota2', 'float'),
        nDeclarar('prom', 'float'),
        nLeer(['nota1']),
        nLeer(['nota2']),
        nAsignar('prom', '(nota1 + nota2) / 2'),
        nMostrar([parteTexto('El promedio es '), parteExpr('prom')]),
        nFin(),
      ]),
    },
    {
      titulo: 'Conversor de horas a minutos',
      consigna: 'Pedir una cantidad de horas y mostrarlas convertidas a minutos.',
      programa: programa([
        nInicio(),
        nDeclarar('horas', 'int'),
        nDeclarar('minutos', 'int'),
        nLeer(['horas']),
        nAsignar('minutos', 'horas * 60'),
        nMostrar([parteTexto('Equivalen a '), parteExpr('minutos'), parteTexto(' minutos')]),
        nFin(),
      ]),
    },
  ],
  preguntas: [
    {
      pregunta: '¿Qué es scanf y para qué sirve?',
      respuesta:
        'scanf es la función de la librería stdio.h que lee datos desde el teclado y los guarda en variables. Recibe un formato (como %d) y la dirección de la variable (&variable).',
    },
    {
      pregunta: '¿Qué es una variable en programación?',
      respuesta:
        'Es un espacio en memoria con un nombre que guarda un valor que puede cambiar. En C++ se declara con un tipo y un nombre, por ejemplo: int edad;. Se le da valor con la asignación (=) o con scanf.',
    },
    {
      pregunta: '¿Por qué scanf usa un ampersand (&) y printf no?',
      respuesta:
        'scanf debe modificar la variable, así que necesita saber DÓNDE está en memoria (su dirección, de ahí el &). printf solo lee el valor, así que basta pasarle el valor mismo.',
    },
    {
      pregunta: '¿Qué tipos de datos básicos vimos y para qué sirven?',
      respuesta:
        'int para números enteros, float para números reales y char para un solo carácter. Cada uno usa un formato en printf/scanf: %d, %f y %c respectivamente.',
    },
    {
      pregunta: '¿Qué diferencia hay entre int y float?',
      respuesta:
        'int guarda números enteros (sin parte decimal). float guarda números reales (con decimales). Al dividir dos enteros en C++ el resultado puede truncarse: 5/2 es 2, no 2.5, a menos que al menos uno sea float.',
    },
    {
      pregunta: '¿Qué significa declarar una variable?',
      respuesta:
        'Declarar es crear la variable indicando su tipo y nombre para reservar espacio en memoria: int a;. Hasta que no le damos un valor, contiene un valor basura; por eso conviene inicializarla o leerla antes de usarla.',
    },
    {
      pregunta: '¿Por qué se usa un mensaje antes del scanf?',
      respuesta:
        'El scanf por sí solo no le muestra nada al usuario. El mensaje con printf (p. ej. "Ingresa un número: ") le dice qué tiene que escribir. Sin él, el usuario vería una pantalla vacía esperando algo.',
    },
    {
      pregunta: '¿Se puede leer más de una variable con un solo scanf?',
      respuesta:
        'Sí: scanf("%d %d", &a, &b); lee dos enteros separados por espacios o saltos de línea. Igual se pueden usar varios scanf, uno por variable, que es más fácil de entender.',
    },
  ],
  reto: {
    titulo: 'La calculadora de la edad',
    descripcion:
      'Pide el año de nacimiento y el año actual, y muestra la edad que tendrá la persona este año. Hazlo en las 4 representaciones y ejecútalo en el laboratorio.',
  },
}
