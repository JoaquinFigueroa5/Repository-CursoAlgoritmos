import { useState } from 'react'
import { Handle, Position } from '@xyflow/react'

/* eslint react-refresh/only-export-components: off */

const cx = (...a) => a.filter(Boolean).join(' ')

const ESTILOS = {
  inicio: { border: 'border-neon-cyan', bg: 'bg-neon-cyan/10', text: 'text-neon-cyan' },
  fin: { border: 'border-neon-red', bg: 'bg-neon-red/10', text: 'text-neon-red' },
  proceso: { border: 'border-neon-green', bg: 'bg-neon-green/10', text: 'text-neon-green' },
  entrada: { border: 'border-neon-pink', bg: 'bg-neon-pink/10', text: 'text-neon-pink' },
  salida: { border: 'border-neon-amber', bg: 'bg-neon-amber/10', text: 'text-neon-amber' },
  decision: { border: 'border-neon-cyan', bg: 'bg-neon-cyan/10', text: 'text-neon-cyan' },
}

function Formas({ data, id, selected }) {
  const [texto, setTexto] = useState(data.label ?? '')
  const size = data.size ?? { w: 160, h: 60 }
  const est = ESTILOS[data.tipo] ?? ESTILOS.proceso
  const s = { width: size.w, height: size.h }
  const brillo = selected ? 'shadow-[0_0_0_2px_rgba(34,211,238,0.6)]' : ''

  const guardar = () => {
    const valor = texto.trim()
    data.onGuardar?.(id, valor === '' ? (data.label ?? '') : valor)
  }

  const input = (
    <input
      value={texto}
      autoFocus
      onChange={(e) => setTexto(e.target.value)}
      onBlur={guardar}
      onKeyDown={(e) => {
        if (e.key === 'Enter') guardar()
        if (e.key === 'Escape') setTexto(data.label ?? '')
      }}
      className="w-full bg-transparent text-center font-mono text-xs outline-none"
      onClick={(e) => e.stopPropagation()}
    />
  )

  return (
    <div className="relative" style={s}>
      <Handle type="target" position={Position.Top} className="!h-2.5 !w-2.5 !border-2 !border-night-950 !bg-night-400" />
      {data.tipo === 'inicio' && (
        <div className={cx('flex h-full w-full items-center justify-center rounded-full border-2', est.border, est.bg, brillo)}>
          {data.editando ? input : <span className={cx('font-mono text-xs font-semibold', est.text)}>{data.label}</span>}
        </div>
      )}
      {data.tipo === 'fin' && (
        <div className={cx('flex h-full w-full items-center justify-center rounded-full border-2', est.border, est.bg, brillo)}>
          {data.editando ? input : <span className={cx('font-mono text-xs font-semibold', est.text)}>{data.label}</span>}
        </div>
      )}
      {data.tipo === 'proceso' && (
        <div className={cx('flex h-full w-full items-center justify-center rounded-lg border-2', est.border, est.bg, brillo)}>
          {data.editando ? input : <span className={cx('px-2 text-center font-mono text-xs leading-4', est.text)}>{data.label}</span>}
        </div>
      )}
      {(data.tipo === 'entrada' || data.tipo === 'salida') && (
        <div className={cx('flex h-full w-full items-center justify-center rounded-md border-2 [transform:skewX(-12deg)]', est.border, est.bg, brillo)}>
          {data.editando ? (
            <span className="px-2 [transform:skewX(12deg)]">{input}</span>
          ) : (
            <span className={cx('px-2 text-center font-mono text-xs leading-4 [transform:skewX(12deg)]', est.text)}>{data.label}</span>
          )}
        </div>
      )}
      {data.tipo === 'decision' && (
        <div className="flex h-full w-full items-center justify-center">
          <div className={cx('absolute inset-0 rotate-45 rounded-sm border-2', est.border, est.bg, brillo)} />
          <span className={cx('relative z-10 px-5 text-center font-mono text-xs leading-4', est.text)}>
            {data.editando ? input : data.label}
          </span>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!h-2.5 !w-2.5 !border-2 !border-night-950 !bg-neon-cyan" />
    </div>
  )
}

export const nodeTypes = { inicio: Formas, fin: Formas, proceso: Formas, entrada: Formas, salida: Formas, decision: Formas }
