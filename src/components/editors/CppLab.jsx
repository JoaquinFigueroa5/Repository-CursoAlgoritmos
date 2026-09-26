import TerminalLab from './TerminalLab.jsx'

const PLANTILLA = `#include <stdio.h>

int main() {
    printf("Hola desde el laboratorio\\n");
    return 0;
}
`

// Laboratorio de las lecciones: usa la misma terminal dedicada que la página
// independiente de Laboratorio (mismo compilador, stdin interactivo y consola).
export default function CppLab({ valorInicial }) {
  return <TerminalLab plantilla={valorInicial ?? PLANTILLA} editorAltura={260} />
}
