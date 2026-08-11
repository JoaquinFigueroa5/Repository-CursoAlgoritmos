import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { CornerDownLeft } from 'lucide-react'

const COLORES = {
  out: 'text-night-100',
  err: 'text-neon-red',
  sys: 'text-neon-amber/80',
  in: 'text-neon-green',
}

const ETIQUETA_ESTADO = {
  inactivo: 'lista',
  compilando: 'compilando…',
  corriendo: 'ejecutando…',
  esperando: 'esperando entrada…',
  fin: 'terminado',
  error: 'error',
}

const BADGE = {
  inactivo: 'bg-night-700 text-night-400',
  compilando: 'bg-neon-amber/15 text-neon-amber',
  corriendo: 'bg-neon-cyan/15 text-neon-cyan',
  esperando: 'bg-neon-green/15 text-neon-green',
  fin: 'bg-neon-cyan/15 text-neon-cyan',
  error: 'bg-neon-red/15 text-neon-red',
}

// Consola simulada tipo terminal. Expone por ref:
// anexar(texto, tipo), anexarError, anexarSistema, limpiar, enfocar.
const SimConsole = forwardRef(function SimConsole(
  { estado = 'inactivo', entradaHabilitada = false, onEntrada },
  ref,
) {
  const [lineas, setLineas] = useState([])
  const [valor, setValor] = useState('')
  const contRef = useRef(null)
  const inputRef = useRef(null)
  const histRef = useRef([])
  const histIdxRef = useRef(-1)

  const anexar = (texto, tipo = 'out') => {
    if (!texto) return
    const partes = texto.split('\n')
    setLineas((prev) => {
      const siguiente = [...prev]
      for (let i = 0; i < partes.length; i++) {
        if (partes[i] === '') continue
        if (i === 0 && siguiente.length && siguiente[siguiente.length - 1].tipo === tipo) {
          siguiente[siguiente.length - 1].s += partes[i]
        } else {
          siguiente.push({ tipo, s: partes[i] })
        }
      }
      return siguiente
    })
  }

  const limpiar = () => {
    setLineas([])
    setValor('')
    histRef.current = []
    histIdxRef.current = -1
  }

  useImperativeHandle(ref, () => ({
    anexar,
    anexarError: (t) => anexar(t, 'err'),
    anexarSistema: (t) => anexar(t, 'sys'),
    limpiar,
    enfocar: () => inputRef.current?.focus(),
  }))

  useEffect(() => {
    if (entradaHabilitada) inputRef.current?.focus()
  }, [entradaHabilitada])

  useEffect(() => {
    const el = contRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lineas, valor, estado])

  const enviar = () => {
    if (!entradaHabilitada) return
    const linea = valor
    setLineas((prev) => [...prev, { tipo: 'in', s: `> ${linea}` }])
    histRef.current.push(linea)
    histIdxRef.current = -1
    setValor('')
    onEntrada?.(`${linea}\n`)
  }

  const manejarTecla = (e) => {
    if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault()
      limpiar()
      return
    }
    if (!entradaHabilitada) return
    if (e.key === 'Enter') {
      e.preventDefault()
      enviar()
      return
    }
    const hist = histRef.current
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (!hist.length) return
      const i = histIdxRef.current === -1 ? hist.length - 1 : Math.max(0, histIdxRef.current - 1)
      histIdxRef.current = i
      setValor(hist[i])
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIdxRef.current === -1) return
      const i = histIdxRef.current + 1
      if (i >= hist.length) {
        histIdxRef.current = -1
        setValor('')
        return
      }
      histIdxRef.current = i
      setValor(hist[i])
    }
  }

  return (
    <div
      className="overflow-hidden rounded-xl border border-night-700 bg-night-950"
      onClick={() => entradaHabilitada && inputRef.current?.focus()}
    >
      {/* barra de título */}
      <div className="flex items-center justify-between border-b border-night-800 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-neon-red/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-neon-amber/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-neon-green/80" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-night-500">
            Consola
          </span>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${BADGE[estado] ?? BADGE.inactivo}`}
        >
          {ETIQUETA_ESTADO[estado] ?? estado}
        </span>
      </div>

      {/* salida */}
      <div ref={contRef} className="h-85 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-6">
        {lineas.length === 0 && (
          <div className="text-night-600">La consola está vacía. Presiona Ejecutar para empezar.</div>
        )}
        {lineas.map((l, i) => (
          <div key={i} className={`whitespace-pre-wrap ${COLORES[l.tipo] ?? COLORES.out}`}>
            {l.s}
          </div>
        ))}
        {entradaHabilitada && (
          <div className="flex items-start text-neon-green">
            <span className="mr-2 shrink-0">›</span>
            <span className="whitespace-pre-wrap break-all">{valor}</span>
            <span className="animate-pulse">▌</span>
          </div>
        )}
      </div>

      {/* pie de ayuda */}
      <div className="flex items-center justify-between border-t border-night-800 px-4 py-1.5">
        <span className="text-[10px] text-night-600">
          {entradaHabilitada
            ? 'Enter envía · ↑ ↓ historial · Ctrl+L limpia'
            : 'Entrada disponible cuando el programa la pida (scanf / cin)'}
        </span>
        <CornerDownLeft size={11} className="text-night-600" />
      </div>

      {/* input invisible que captura el teclado */}
      <input
        ref={inputRef}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onKeyDown={manejarTecla}
        disabled={!entradaHabilitada}
        className="sr-only"
        aria-label="Entrada de la consola simulada"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
      />
    </div>
  )
})

export default SimConsole
