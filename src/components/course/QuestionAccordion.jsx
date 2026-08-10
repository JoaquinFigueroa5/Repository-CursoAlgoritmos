import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

export default function QuestionAccordion({ preguntas }) {
  const [abierta, setAbierta] = useState(0)

  return (
    <div className="space-y-3">
      {preguntas.map((p, i) => {
        const activa = abierta === i
        return (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-night-700 bg-night-900/60 transition-colors"
          >
            <button
              onClick={() => setAbierta(activa ? -1 : i)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
            >
              <HelpCircle size={17} className="shrink-0 text-neon-cyan/70" />
              <span className="flex-1 text-sm font-medium leading-5 text-night-100">
                {p.pregunta}
              </span>
              <ChevronDown
                size={16}
                className={`shrink-0 text-night-400 transition-transform ${activa ? 'rotate-180 text-neon-cyan' : ''}`}
              />
            </button>
            {activa && (
              <div className="border-t border-night-800 bg-night-950/40 px-4 py-3.5">
                <p className="text-sm leading-6 text-night-300">{p.respuesta}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
