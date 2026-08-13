import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Necesario para la consola interactiva del laboratorio C++:
// habilita SharedArrayBuffer (crossOriginIsolated) para bloquear
// el worker mientras espera entrada del usuario.
const SEGURIDAD = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'credentialless',
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Pre-empacar estas dependencias al arrancar el server: se usan desde un
  // worker creado en runtime y con import() dinámico, y si Vite las optimiza
  // en pleno vuelo el worker se queda esperando sin respuesta.
  optimizeDeps: {
    include: ['browsercc', '@bjorn3/browser_wasi_shim'],
  },
  server: { headers: SEGURIDAD },
  preview: { headers: SEGURIDAD },
  build: {
    chunkSizeWarningLimit: 5000,
  },
})
