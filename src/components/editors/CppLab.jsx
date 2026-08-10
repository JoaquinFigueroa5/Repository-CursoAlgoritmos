import { useState } from 'react'
import { Play, RotateCcw, Loader2, Terminal, TriangleAlert } from 'lucide-react'
import CmEditor from './Editors.jsx'
import { ejecutarCpp, toolchainEstado } from '../../exec/cppRunner.js'

const PLANTILLA = `#include <stdio.h>

int main() {
    printf("Hola desde el laboratorio\\n");
    return 0;
}
`

export default function CppLab({ valorInicial }) {
  const [codigo, setCodigo] = useState(valorInicial ?? PLANTILLA)
  const [entrada, setEntrada] = useState('')
  const [ejecutando, setEjecutando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [estado, setEstado] = useState(toolchainEstado())

  const ejecutar = async () => {
    setEjecutando(true)
    setResultado(null)
    try {
      const r = await ejecutarCpp({ codigo, entrada })
      setResultado(r)
    } catch (e) {
      setResultado({ ok: false, salida: '', errores: String(e?.message ?? e) })
    } finally {
      setEjecutando(false)
      setEstado(toolchainEstado())
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-night-300">
          <Terminal size={15} className="text-neon-cyan" />
          <span>Escribe, compila y ejecuta C++ real (compilado en tu navegador)</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
              estado === 'lista'
                ? 'bg-neon-green/15 text-neon-green'
                : estado === 'cargando'
                  ? 'bg-neon-amber/15 text-neon-amber'
                  : 'bg-night-700 text-night-400'
            }`}
          >
            {estado === 'lista' ? 'compilador listo' : estado === 'cargando' ? 'cargando…' : 'sin cargar'}
          </span>
        </div>
        <button
          onClick={ejecutar}
          disabled={ejecutando}
          className="flex items-center gap-2 rounded-lg bg-neon-cyan px-4 py-2 text-sm font-bold text-night-950 transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] disabled:cursor-wait disabled:opacity-60"
        >
          {ejecutando ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
          {ejecutando ? 'Compilando…' : 'Ejecutar'}
        </button>
      </div>

      <CmEditor value={codigo} onChange={setCodigo} lenguaje="cpp" minHeight={260} />

      <details className="group rounded-xl border border-night-700 bg-night-900/60">
        <summary className="cursor-pointer px-4 py-2.5 text-sm font-medium text-night-300 select-none">
          Datos de entrada (stdin)
        </summary>
        <div className="px-4 pb-3">
          <CmEditor value={entrada} onChange={setEntrada} lenguaje="natural" minHeight={70} />
        </div>
      </details>

      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setResultado(null)
            setEntrada('')
          }}
          className="flex items-center gap-2 rounded-lg border border-night-700 px-3 py-1.5 text-xs font-medium text-night-300 transition-colors hover:border-night-500 hover:text-night-100"
        >
          <RotateCcw size={13} />
          Limpiar salida
        </button>
      </div>

      {resultado && (
        <div
          className={`rounded-xl border p-4 font-mono text-[13px] leading-6 ${
            resultado.ok
              ? 'border-neon-green/30 bg-neon-green/5 text-neon-green'
              : 'border-neon-red/40 bg-neon-red/5 text-neon-red'
          }`}
        >
          <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest">
            <TriangleAlert size={13} />
            {resultado.ok ? 'Salida del programa' : 'Error'}
          </div>
          <pre className="whitespace-pre-wrap font-mono text-night-100">
            {resultado.salida || (resultado.ok ? '…' : '')}
          </pre>
          {resultado.errores && (
            <pre className="mt-2 whitespace-pre-wrap border-t border-neon-red/20 pt-2 text-neon-red/90">
              {resultado.errores}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
