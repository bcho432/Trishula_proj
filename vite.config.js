import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// OpenStreetMap Nominatim (free, no API key). Proxied in dev because the API does not allow browser CORS.
// User-Agent: https://operations.osmfoundation.org/policies/nominatim/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/nominatim': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/nominatim/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader(
              'User-Agent',
              'TrishulaAI-LeadFinder/1.0 (security-camera lead research)',
            )
          })
        },
      },
    },
  },
})
