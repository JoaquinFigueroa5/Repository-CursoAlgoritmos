// ============================================================
// cppRunner.js — Compila y ejecuta C++ en el navegador
// usando browsercc (clang a wasm) + browser_wasi_shim.
// ============================================================

import { compile } from 'browsercc'

let toolchainCargando = null
let toolchainLista = false

export function toolchainEstado() {
  return toolchainLista ? 'lista' : toolchainCargando ? 'cargando' : 'apagada'
}

async function asegurarToolchain() {
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
