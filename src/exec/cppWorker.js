// ============================================================
// cppWorker.js — Ejecuta un módulo WebAssembly compilado con
// stdin interactivo: cuando el programa pide entrada (scanf/cin)
// bloquea su hilo con Atomics.wait hasta que el hilo principal
// envía una línea desde la consola simulada.
// ============================================================

import { WASI, ConsoleStdout, Fd, Inode, wasi } from '@bjorn3/browser_wasi_shim'

class StdinInteractivo extends Fd {
  constructor(signal, data) {
    super()
    this.ino = Inode.issue_ino()
    this.signal = signal
    this.data = data
    this.pos = 0
    this.len = 0
    this.eof = false
  }

  fd_filestat_get() {
    const filestat = new wasi.Filestat(this.ino, wasi.FILETYPE_CHARACTER_DEVICE, 0n)
    return { ret: 0, filestat }
  }

  fd_fdstat_get() {
    const fdstat = new wasi.Fdstat(wasi.FILETYPE_CHARACTER_DEVICE, 0)
    fdstat.fs_rights_base = BigInt(wasi.RIGHTS_FD_READ)
    return { ret: 0, fdstat }
  }

  fd_read(size) {
    if (this.eof) return { ret: 0, data: new Uint8Array(0) }
    if (this.pos >= this.len) {
      this.pos = 0
      this.len = 0
      postMessage({ type: 'pidiendo-entrada' })
      while (Atomics.load(this.signal, 0) === 0) {
        Atomics.wait(this.signal, 0, 0)
      }
      this.len = this.signal[1]
      Atomics.store(this.signal, 0, 0)
      Atomics.store(this.signal, 1, 0)
      if (this.len === 0) {
        this.eof = true
        return { ret: 0, data: new Uint8Array(0) }
      }
    }
    const n = Math.min(size, this.len - this.pos)
    const out = new Uint8Array(this.data.subarray(this.pos, this.pos + n))
    this.pos += n
    return { ret: 0, data: out }
  }
}

self.onmessage = async (e) => {
  const { type, bytes, byteLength, flagBuf, dataBuf } = e.data
  if (type !== 'iniciar' || !bytes) return

  try {
    postMessage({ type: 'listo' })

    const stdin = new StdinInteractivo(new Int32Array(flagBuf), new Uint8Array(dataBuf))
    const fds = [
      stdin,
      new ConsoleStdout((d) => {
        const t = new TextDecoder().decode(d)
        postMessage({ type: 'out', texto: t })
      }),
      new ConsoleStdout((d) => {
        const t = new TextDecoder().decode(d)
        postMessage({ type: 'err', texto: t })
      }),
    ]

    const wasiInst = new WASI([], [], fds, { debug: false })
    const bytesView = new Uint8Array(bytes, 0, byteLength)
    postMessage({ type: 'estado', texto: 'compilando' })
    const { instance } = await WebAssembly.instantiate(bytesView, {
      wasi_snapshot_preview1: wasiInst.wasiImport,
    })
    postMessage({ type: 'estado', texto: 'arrancando' })
    const exitCode = wasiInst.start(instance)
    postMessage({ type: 'fin', exitCode })
  } catch (err) {
    postMessage({ type: 'fin', errores: err?.message ?? String(err) })
  }
}
