// ============================================================
// cppRunner.js — Compila y ejecuta C++ en el navegador
// usando browsercc (clang a wasm) + browser_wasi_shim.
// ============================================================

import { compile } from 'browsercc'
import { compilarBytes } from './cppCompilar.js'

let toolchainCargando = null
let toolchainLista = false

export function toolchainEstado() {
  return toolchainLista ? 'lista' : toolchainCargando ? 'cargando' : 'apagada'
}

export function crossOriginAislado() {
  return (
    typeof SharedArrayBuffer !== 'undefined' &&
    typeof globalThis.crossOriginIsolated === 'boolean' &&
    globalThis.crossOriginIsolated
  )
}

export async function asegurarToolchain() {
  if (!toolchainCargando) {
    toolchainCargando = (async () => {
      await compile({
        source: 'int main() { return 0; }',
        fileName: 'warm.cpp',
        flags: ['-std=c++17', '-O0'],
      })
      toolchainLista = true
    })().catch((e) => {
      toolchainCargando = null
      throw e
    })
  }
  return toolchainCargando
}

export async function ejecutarCpp({ codigo, entrada = '' }) {
  try {
    await asegurarToolchain()
  } catch (e) {
    return { ok: false, salida: '', errores: `No se pudo cargar el compilador: ${e.message}` }
  }

  const { WASI, File, OpenFile, ConsoleStdout } = await import('@bjorn3/browser_wasi_shim')
  let stdout = ''
  let stderr = ''
  let compilacion

  try {
    compilacion = await compile({
      source: codigo,
      fileName: 'main.cpp',
      flags: ['-std=c++17', '-O0'],
    })
  } catch (e) {
    return { ok: false, salida: '', errores: `Error al compilar: ${e.message}` }
  }

  if (!compilacion.module) {
    return { ok: false, salida: '', errores: compilacion.compileOutput || 'El programa no compiló.' }
  }

  try {
    const stdinFile = new File(new TextEncoder().encode(entrada))
    const fds = [
      new OpenFile(stdinFile),
      new ConsoleStdout((d) => {
        stdout += new TextDecoder().decode(d)
      }),
      new ConsoleStdout((d) => {
        stderr += new TextDecoder().decode(d)
      }),
    ]
    const wasi = new WASI([], [], fds, { debug: false })
    const instance = await WebAssembly.instantiate(compilacion.module, {
      wasi_snapshot_preview1: wasi.wasiImport,
    })
    wasi.start(instance)
    return { ok: true, salida: stdout, errores: stderr || '' }
  } catch (e) {
    return {
      ok: false,
      salida: stdout,
      errores: `Error en tiempo de ejecución: ${e?.message ?? String(e)}`,
    }
  }
}

// ============================================================
// Sesión interactiva: compila en el hilo principal y ejecuta en
// un worker con stdin bloqueante (requiere crossOriginIsolated).
// Devuelve un handle { enviarEntrada, detener } o null si falla.
// ============================================================

export async function iniciarSesionInteractiva({ codigo, onOut, onErr, onEstado }) {
  if (!crossOriginAislado()) return null

  try {
    await asegurarToolchain()
  } catch (e) {
    onEstado?.('error')
    onErr?.(`No se pudo cargar el compilador: ${e.message}`)
    return null
  }

  let compilacion
  try {
    compilacion = await compilarBytes({
      source: codigo,
      fileName: 'main.cpp',
      flags: ['-std=c++17', '-O0'],
    })
  } catch (e) {
    onEstado?.('error')
    onErr?.(`Error al compilar: ${e.message}`)
    return null
  }

  if (!compilacion.bytes) {
    onEstado?.('error')
    onErr?.(compilacion.compileOutput || 'El programa no compiló.')
    return null
  }

  const BUF = 65536
  const flagBuf = new SharedArrayBuffer(8)
  const dataBuf = new SharedArrayBuffer(BUF)
  const signal = new Int32Array(flagBuf)
  const data = new Uint8Array(dataBuf)

  let worker
  try {
    worker = new Worker(new URL('./cppWorker.js', import.meta.url), { type: 'module' })
  } catch (e) {
    onEstado?.('error')
    onErr?.(`No se pudo crear el worker de ejecución: ${e.message}`)
    return null
  }

  // Si el worker no confirma que recibió el módulo (carga de deps en dev
  // puede colgarse silenciosamente), abortamos en vez de dejar la UI muda.
  let activo = true
  const temporizador = setTimeout(() => {
    if (!activo) return
    activo = false
    try {
      worker.terminate()
    } catch {
      /* ya terminado */
    }
    onEstado?.('error')
    onErr?.('El worker de ejecución no respondió (la sesión se canceló).')
  }, 30000)

  const cancelarTemporizador = () => {
    if (!activo) return
    activo = false
    clearTimeout(temporizador)
  }

  worker.onmessage = (e) => {
    const m = e.data
    if (m.type === 'listo') {
      cancelarTemporizador()
      return
    }
    if (m.type === 'estado') {
      console.debug('[worker]', m.texto)
      return
    }
    if (m.type === 'out') onOut?.(m.texto)
    else if (m.type === 'err') onErr?.(m.texto)
    else if (m.type === 'pidiendo-entrada') onEstado?.('esperando')
    else if (m.type === 'fin') {
      if (m.errores) onErr?.(m.errores)
      onEstado?.('fin')
    }
  }
  worker.onerror = (e) => {
    cancelarTemporizador()
    onEstado?.('error')
    onErr?.(`Error en la ejecución: ${e.message}`)
  }

  try {
    const buffer = compilacion.bytes.buffer
    worker.postMessage(
      { type: 'iniciar', bytes: buffer, byteLength: compilacion.bytes.length, flagBuf, dataBuf },
      [buffer],
    )
  } catch (e) {
    cancelarTemporizador()
    onEstado?.('error')
    onErr?.(`No se pudo iniciar la ejecución: ${e.message}`)
    return null
  }
  onEstado?.('corriendo')

  return {
    enviarEntrada(linea) {
      const bytes = new TextEncoder().encode(linea)
      const n = Math.min(bytes.length, BUF)
      data.set(bytes.subarray(0, n))
      signal[1] = n
      Atomics.store(signal, 0, 1)
      Atomics.notify(signal, 0)
    },
    detener() {
      cancelarTemporizador()
      try {
        worker.terminate()
      } catch {
        /* ya terminado */
      }
    },
  }
}
