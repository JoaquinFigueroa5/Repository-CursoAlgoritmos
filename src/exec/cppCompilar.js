// ============================================================
// cppCompilar.js — Compila C++ a wasm devolviendo los bytes crudos.
// Igual pipeline que browsercc.compile(), pero en vez de quedarse
// con el WebAssembly.Module entrega el ArrayBuffer del binario:
// un WebAssembly.Module no es transferible por postMessage en
// Firefox/Safari, así que el worker instancia desde los bytes.
// ============================================================

import { Clang, LLD, getCompilerInvocation, setUpSysroot } from 'browsercc'
import sysrootUrl from 'browsercc/dist/sysroot.tar?url'

export async function compilarBytes({ source, fileName, flags }) {
  let stderr = ''
  const clangPromise = Clang({
    thisProgram: 'clang++',
    printErr: (data) => {
      stderr += data + '\n'
    },
  })
  const lldPromise = LLD({
    thisProgram: 'wasm-ld',
    printErr: (data) => {
      stderr += data + '\n'
    },
  })
  const sysroot = await (await fetch(sysrootUrl)).arrayBuffer()
  const invocation = await getCompilerInvocation(fileName, source, flags)
  const clang = await clangPromise
  clang.FS.writeFile(fileName, source)
  setUpSysroot(clang, sysroot)
  let exitCode = clang.callMain(invocation.compilerArgs)
  if (exitCode !== 0) {
    return { compileOutput: stderr, bytes: null }
  }
  const binary = clang.FS.readFile(invocation.compilerArtifact, {
    encoding: 'binary',
  })
  const lld = await lldPromise
  lld.FS.writeFile(invocation.compilerArtifact, binary)
  setUpSysroot(lld, sysroot)
  exitCode = lld.callMain(invocation.linkerArgs)
  if (exitCode !== 0) {
    return { compileOutput: stderr, bytes: null }
  }
  const output = lld.FS.readFile(invocation.linerArtifact, {
    encoding: 'binary',
  })
  return { compileOutput: stderr, bytes: output.slice() }
}
