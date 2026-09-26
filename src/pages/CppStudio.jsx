import { Terminal } from 'lucide-react'
import TerminalLab from '../components/editors/TerminalLab.jsx'
import { SpecLabel } from '../components/common/SchematicFrame.jsx'

const CLAVE_STORAGE = 'algoritmos-lab-codigo-cpp'

export default function CppStudio() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <SpecLabel>Sección · Compilación</SpecLabel>
        <h1 className="mt-3 flex items-center gap-3 font-heading text-4xl font-bold uppercase tracking-tight text-night-50">
          <span className="flex h-9 w-9 items-center justify-center border border-neon-cyan/40 bg-neon-cyan/10">
            <Terminal size={18} className="text-neon-cyan" />
          </span>
          Laboratorio C++
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-night-300">
          Escribe, compila y ejecuta C++ real en tu navegador. La salida aparece en la consola
          simulada y, cuando tu programa pide datos con <code className="text-neon-cyan">scanf</code> o{' '}
          <code className="text-neon-cyan">cin</code>, la consola espera tu entrada.
        </p>
      </div>

      <TerminalLab persistencia={CLAVE_STORAGE} />
    </div>
  )
}
