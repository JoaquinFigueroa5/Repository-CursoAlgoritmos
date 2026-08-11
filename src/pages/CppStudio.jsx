import { useEffect, useRef, useState } from 'react'
import { Play, Square, Eraser, RotateCcw, Terminal } from 'lucide-react'
import CmEditor from '../components/editors/Editors.jsx'
import SimConsole from '../components/terminal/SimConsole.jsx'
import {
  iniciarSesionInteractiva,
  ejecutarCpp,
  asegurarToolchain,
  toolchainEstado,
  crossOriginAislado,
} from '../exec/cppRunner.js'

const CLAVE_STORAGE = 'algoritmos-lab-codigo-cpp'

const PLANTILLA = `#include <stdio.h>

int main() {
  printf("Hola mundo");
  return 0;
}
`

const BADGE_TOOLCHAIN = {
  lista: 'bg-neon-green/15 text-neon-green',
  cargando: 'bg-neon-amber/15 text-neon-amber',
  apagada: 'bg-night-700 text-night-400',
}

const TEXTO_TOOLCHAIN = {
  lista: 'compilador listo',
  cargando: 'cargando…',
  apagada: 'sin cargar',
}

export default function CppStudio() {
  const [codigo, setCodigo] = useState(() => localStorage.getItem(CLAVE_STORAGE) || PLANTILLA)
  const [interactivo] = useState(() => crossOriginAislado())
  const [entradaLote, setEntradaLote] = useState('')
  const [estado, setEstado] = useState('inactivo')
  const [toolchain, setToolchain] = useState(toolchainEstado())

  const consolaRef = useRef(null)
  const sesionRef = useRef(null)
  const corriendoRef = useRef(false)
  const interactivoRef = useRef(interactivo)
  const ejecutarRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(CLAVE_STORAGE, codigo)
  }, [codigo])

  useEffect(() => {
    consolaRef.current?.anexarSistema(
      interactivoRef.current
        ? 'Terminal lista. Escribe tu código y presiona Ejecutar (Ctrl+Enter).'
        : 'Modo compatibilidad (sin headers COOP/COEP): la entrada será por lotes, no interactiva.',
    )
  }, [])

  // Precarga la toolchain (~90MB en la primera visita) para que el primer
  // Ejecutar no se quede mudo descargando el compilador.
  useEffect(() => {
    let activo = true
    const precargar = async () => {
      setToolchain('cargando')
      try {
        await asegurarToolchain()
      } catch {
        /* el error se mostrará al ejecutar */
      }
      if (activo) setToolchain(toolchainEstado())
    }
    precargar()
    return () => {
      activo = false
    }
  }, [])

  // Cualquier error no capturado debe ser visible en la consola, nunca mudo.
  useEffect(() => {
    const capturarError = (e) => {
      const razon = e?.reason ?? e?.error
      const mensaje = razon?.message ?? e?.message ?? (razon ? String(razon) : '')
      if (mensaje) consolaRef.current?.anexarError(`[error] ${mensaje}`)
    }
    window.addEventListener('error', capturarError)
    window.addEventListener('unhandledrejection', capturarError)
    return () => {
      window.removeEventListener('error', capturarError)
      window.removeEventListener('unhandledrejection', capturarError)
    }
  }, [])

  const manejarEstado = (nuevo) => {
    setEstado(nuevo)
    if (nuevo === 'fin' || nuevo === 'error') corriendoRef.current = false
    setToolchain(toolchainEstado())
  }

  const ejecutar = async () => {
    if (corriendoRef.current) return
    corriendoRef.current = true
    consolaRef.current?.anexarSistema('▶ Ejecutando…')
    setEstado('compilando')

    try {
      if (interactivo) {
        sesionRef.current = await iniciarSesionInteractiva({
          codigo,
          onEstado: manejarEstado,
          onOut: (t) => consolaRef.current?.anexar(t),
          onErr: (t) => consolaRef.current?.anexarError(t),
        })
        if (!sesionRef.current) manejarEstado('error')
      } else {
        const r = await ejecutarCpp({ codigo, entrada: entradaLote })
        if (r.ok) {
          consolaRef.current?.anexar(r.salida)
          if (r.errores) consolaRef.current?.anexarError(r.errores)
        } else {
          consolaRef.current?.anexarError(r.errores || 'El programa no compiló.')
        }
        manejarEstado(r.ok ? 'fin' : 'error')
      }
    } catch (e) {
      manejarEstado('error')
      consolaRef.current?.anexarError(`Error inesperado: ${e?.message ?? String(e)}`)
    } finally {
      // En modo interactivo la sesión sigue viva y es 'fin'/'error' quien
      // desbloquea el botón; si no hay sesión activa, liberamos siempre.
      if (corriendoRef.current && !sesionRef.current) corriendoRef.current = false
    }
  }

  const detener = () => {
    sesionRef.current?.detener()
    sesionRef.current = null
    corriendoRef.current = false
    consolaRef.current?.anexarSistema('■ Ejecución detenida')
    setEstado('inactivo')
  }

  const limpiar = () => {
    consolaRef.current?.limpiar()
    consolaRef.current?.anexarSistema('Consola limpia.')
  }

  const restablecerPlantilla = () => {
    setCodigo(PLANTILLA)
  }

  useEffect(() => {
    ejecutarRef.current = ejecutar
  })

  useEffect(() => {
    const f = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        ejecutarRef.current?.()
      }
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [])

  const corriendo = estado === 'compilando' || estado === 'corriendo' || estado === 'esperando'
  const entradaHabilitada = interactivo && estado === 'esperando'

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="flex items-center gap-3 text-3xl font-black text-night-50">
          <Terminal size={28} className="text-neon-cyan" />
          Laboratorio C++
        </h1>
        <p className="mt-2 max-w-2xl text-night-400">
          Escribe, compila y ejecuta C++ real en tu navegador. La salida aparece en la consola
          simulada y, cuando tu programa pide datos con <code className="text-neon-cyan">scanf</code> o{' '}
          <code className="text-neon-cyan">cin</code>, la consola espera tu entrada.
        </p>
      </div>

      {/* aviso de modo compatibilidad */}
      {!interactivo && (
        <div className="mb-6 rounded-xl border border-neon-amber/30 bg-neon-amber/5 p-4 text-sm leading-6 text-neon-amber">
          Consola interactiva desactivada: este servidor no envía los headers COOP/COEP, así que
          el navegador no permite entrada por consola. Usa la entrada por lotes (abajo) y presiona
          Ejecutar.
        </div>
      )}

      {/* barra de acciones */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span
          className={`mr-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${BADGE_TOOLCHAIN[toolchain] ?? BADGE_TOOLCHAIN.apagada}`}
        >
          {TEXTO_TOOLCHAIN[toolchain] ?? 'sin cargar'}
        </span>
        <button
          onClick={ejecutar}
          disabled={corriendo}
          className="flex items-center gap-2 rounded-lg bg-neon-cyan px-4 py-2 text-sm font-bold text-night-950 transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] disabled:cursor-wait disabled:opacity-60"
        >
          <Play size={15} />
          {corriendo ? 'Ejecutando…' : 'Ejecutar'}
        </button>
        <button
          onClick={detener}
          disabled={!interactivo || !corriendo}
          className="flex items-center gap-2 rounded-lg border border-neon-red/50 px-3 py-2 text-sm font-semibold text-neon-red transition-colors hover:bg-neon-red/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Square size={13} />
          Detener
        </button>
        <button
          onClick={limpiar}
          className="flex items-center gap-2 rounded-lg border border-night-700 px-3 py-2 text-sm font-medium text-night-300 transition-colors hover:border-night-500 hover:text-night-100"
        >
          <Eraser size={13} />
          Limpiar
        </button>
        <button
          onClick={restablecerPlantilla}
          className="flex items-center gap-2 rounded-lg border border-night-700 px-3 py-2 text-sm font-medium text-night-300 transition-colors hover:border-night-500 hover:text-night-100"
        >
          <RotateCcw size={13} />
          Plantilla
        </button>
      </div>

      {/* editor */}
      <CmEditor value={codigo} onChange={setCodigo} lenguaje="cpp" minHeight={320} />

      {/* entrada por lotes (modo compatibilidad) */}
      {!interactivo && (
        <div className="mt-4">
          <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-night-500">
            Entrada (stdin)
          </label>
          <CmEditor value={entradaLote} onChange={setEntradaLote} lenguaje="natural" minHeight={80} />
        </div>
      )}

      {/* consola */}
      <div className="mt-5">
        <SimConsole
          ref={consolaRef}
          estado={estado}
          entradaHabilitada={entradaHabilitada}
          onEntrada={(linea) => sesionRef.current?.enviarEntrada(linea)}
        />
        <p className="mt-2 text-xs text-night-500">
          Consejo: el atajo <kbd className="rounded border border-night-700 bg-night-900 px-1.5 py-0.5 text-night-300">Ctrl</kbd>+
          <kbd className="rounded border border-night-700 bg-night-900 px-1.5 py-0.5 text-night-300">Enter</kbd>{' '}
          ejecuta el código. El código se guarda automáticamente en tu navegador.
        </p>
      </div>
    </div>
  )
}
