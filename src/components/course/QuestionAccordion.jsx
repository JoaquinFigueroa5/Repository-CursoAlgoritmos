import { useState } from 'react'

export default function QuestionAccordion({ preguntas }) {
  const [abierta, setAbierta] = useState(0)

  return (
    <div className="space-y-2">
      {preguntas.map((p, i) => {
        const activa = abierta === i
        return (
          <div
            key={i}
            className={`overflow-hidden rounded-sm border bg-night-900/60 transition-colors ${
              activa ? 'border-neon-cyan/40' : 'border-night-700/70 hover:border-night-500/70'
            }`}
          >
            <button
              onClick={() => setAbierta(activa ? -1 : i)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
              aria-expanded={activa}
            >
              <span className="shrink-0 font-mono text-[10px] font-bold text-night-500">
                Q0{i + 1}
              </span>
              <span className="flex-1 text-sm font-medium leading-5 text-night-100">
                {p.pregunta}
              </span>
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center border font-mono text-sm leading-none transition-colors ${
                  activa
                    ? 'border-neon-cyan/60 text-neon-cyan'
                    : 'border-night-700 text-night-400'
                }`}
              >
                {activa ? '−' : '+'}
              </span>
            </button>
            {activa && (
              <div className="border-t border-night-700/70 bg-night-950/40 px-4 py-3.5">
                <p className="text-sm leading-6 text-night-300">{p.respuesta}</p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
