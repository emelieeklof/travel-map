import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Listen on all network interfaces so phones on the same Wi-Fi can open the
  // app via your laptop's LAN IP (printed in the dev-server startup banner).
  server: { host: true },
})
