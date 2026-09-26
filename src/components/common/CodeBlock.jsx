import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export default function CodeBlock({ code, label, dense = false }) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      /* clipboard no disponible */
    }
    setCopiado(true)
    setTimeout(() => setCopiado(false), 1500)
  }

  return (
    <div className="overflow-hidden rounded-sm border border-night-700/70 bg-night-900/80">
      <div className="flex items-center justify-between gap-2 border-b border-night-700/70 bg-night-800/40 px-3 py-2">
        <span className="flex items-center gap-2 truncate font-mono text-[10px] font-bold uppercase tracking-widest text-night-400">
          <span className="h-1.5 w-1.5 rounded-full bg-night-600" />
          {label || 'código'}
        </span>
        <button
          onClick={copiar}
          className="flex shrink-0 items-center gap-1.5 rounded-sm border border-night-700 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-night-300 transition-colors hover:border-neon-cyan/50 hover:text-neon-cyan"
        >
          {copiado ? <Check size={11} /> : <Copy size={11} />}
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className={`overflow-x-auto px-4 font-mono text-[13px] leading-relaxed text-night-200 ${dense ? 'py-3' : 'py-4'}`}>
        {code}
      </pre>
    </div>
  )
}
