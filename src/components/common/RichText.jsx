import { BookOpen } from 'lucide-react'
import CodeBlock from './CodeBlock.jsx'

// Convierte `codigo` y **negritas** en <code>/<strong>
function Inline({ texto }) {
  const partes = texto.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean)
  return (
    <>
      {partes.map((p, i) => {
        if (p.startsWith('`') && p.endsWith('`')) {
          return (
            <code
              key={i}
              className="rounded-sm border border-night-700/60 bg-night-800 px-1.5 py-0.5 font-mono text-[0.85em] text-neon-cyan"
            >
              {p.slice(1, -1)}
            </code>
          )
        }
        if (p.startsWith('**') && p.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-night-50">
              {p.slice(2, -2)}
            </strong>
          )
        }
        return <span key={i}>{p}</span>
      })}
    </>
  )
}

export default function RichText({ bloque }) {
  switch (bloque.tipo) {
    case 'parrafo':
      return (
        <p className="leading-7 text-night-200">
          <Inline texto={bloque.contenido} />
        </p>
      )
    case 'lista':
      return (
        <div>
          {bloque.titulo && (
            <p className="mb-2 font-semibold text-night-100">{bloque.titulo}</p>
          )}
          <ul className="space-y-2">
            {bloque.items.map((item, i) => (
              <li key={i} className="flex gap-3 leading-6 text-night-200">
                <span className="mt-px shrink-0 font-mono text-sm font-bold text-neon-cyan">
                  +
                </span>
                <span>
                  <Inline texto={item} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      )
    case 'codigo':
      return <CodeBlock code={bloque.contenido} label={bloque.lenguaje === 'cpp' ? 'C++' : bloque.lenguaje} />
    case 'nota':
      return (
        <div className="relative flex gap-3 overflow-hidden rounded-sm border border-neon-amber/30 bg-neon-amber/5 p-4">
          <span className="absolute inset-y-0 left-0 w-1 bg-neon-amber/60" />
          <span className="shrink-0 font-mono text-[9px] font-black uppercase tracking-widest text-neon-amber">
            Nota
          </span>
          <p className="text-sm leading-6 text-night-200">
            <Inline texto={bloque.contenido} />
          </p>
        </div>
      )
    case 'tabla':
      return (
        <div className="overflow-x-auto rounded-sm border border-night-700/70">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-night-700/70 bg-night-800/60">
                {bloque.encabezados.map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left font-mono text-[11px] font-bold uppercase tracking-wider text-neon-cyan">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bloque.filas.map((fila, i) => (
                <tr key={i} className="border-b border-night-800 last:border-0">
                  {fila.map((celda, j) => (
                    <td key={j} className="px-4 py-2.5 text-night-200">
                      <Inline texto={celda} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    default:
      return null
  }
}

export function SeccionInfo({ titulo, descripcion }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-sm border border-neon-cyan/30 bg-neon-cyan/10">
        <BookOpen size={16} className="text-neon-cyan" />
      </div>
      <div>
        <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-night-50">
          {titulo}
        </p>
        <p className="text-sm text-night-400">{descripcion}</p>
      </div>
    </div>
  )
}
