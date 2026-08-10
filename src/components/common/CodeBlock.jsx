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
    <div className="rounded-xl border border-night-700 bg-night-900/80 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-night-700/80 bg-night-800/40">
        <span className="font-mono text-[11px] uppercase tracking-widest text-night-400 truncate">
          {label || 'código'}
        </span>
        <button
          onClick={copiar}
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-night-700 px-2 py-1 text-[11px] font-medium text-night-300 transition-colors hover:border-neon-cyan/50 hover:text-neon-cyan"
        >
          {copiado ? <Check size={12} /> : <Copy size={12} />}
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <pre className={`overflow-x-auto px-4 font-mono text-[13px] leading-relaxed text-night-200 ${dense ? 'py-3' : 'py-4'}`}>
        {code}
      </pre>
    </div>
  )
}
