import { useState } from 'react'
import { Languages, ListChecks, Workflow, Braces } from 'lucide-react'
import { naturalDesdePrograma } from '../../engine/natural.js'
import { pseudoDesdePrograma } from '../../engine/pseudocode.js'
import { cppDesdePrograma } from '../../engine/cpp.js'
import { flujoDesdePrograma } from '../../engine/flowchart.js'
import CodeBlock from '../common/CodeBlock.jsx'
import FlowCanvas from '../flow/FlowCanvas.jsx'

const TABS = [
  { id: 'natural', label: 'Algoritmo', icono: Languages, color: 'text-neon-green' },
  { id: 'pseudo', label: 'Pseudocódigo', icono: ListChecks, color: 'text-neon-pink' },
  { id: 'flujo', label: 'Diagrama', icono: Workflow, color: 'text-neon-amber' },
  { id: 'cpp', label: 'C++', icono: Braces, color: 'text-neon-cyan' },
]

export default function FourWays({ programa: prog, defaultTab = 'natural', altoFlujo = 420 }) {
  const [tab, setTab] = useState(defaultTab)

  const contenido = {
    natural: { texto: naturalDesdePrograma(prog), label: 'algoritmo.txt' },
    pseudo: { texto: pseudoDesdePrograma(prog), label: 'algoritmo.pseudo' },
    cpp: { texto: cppDesdePrograma(prog), label: 'programa.cpp' },
    flujo: null,
  }

  let flujo
  try {
    flujo = flujoDesdePrograma(prog)
  } catch {
    flujo = null
  }

  return (
    <div className="rounded-2xl border border-night-700 bg-night-900/60">
      <div className="flex flex-wrap items-center gap-1 border-b border-night-700 p-1.5">
        {TABS.map((t) => {
          const Icono = t.icono
          const activo = tab === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activo
                  ? `bg-night-800 text-neon-cyan shadow-[inset_0_0_0_1px_rgba(34,211,238,0.35)]`
                  : 'text-night-400 hover:bg-night-800/60 hover:text-night-200'
              }`}
            >
              <Icono size={13} className={t.color} />
              {t.label}
            </button>
          )
        })}
      </div>
      <div className="p-3 sm:p-4">
        {tab === 'flujo' ? (
          flujo ? (
            <FlowCanvas nodes={flujo.nodes} edges={flujo.edges} editable={false} minHeight={altoFlujo} />
          ) : (
            <p className="py-8 text-center text-sm text-night-400">No se pudo generar el diagrama.</p>
          )
        ) : (
          <CodeBlock code={contenido[tab].texto} label={contenido[tab].label} />
        )}
      </div>
    </div>
  )
}
