import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const gateway = env.VITE_API_GATEWAY_URL || 'http://localhost:8765'
  const initialUserService = env.VITE_INITIAL_USER_API_URL || 'http://localhost:8082'

  return {
    plugins: [react(), tailwindcss()],
    base: '/demo/',
    server: {
      proxy: {
        '/initial-user': {
          target: initialUserService,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/initial-user/, ''),
        },
        '/auth-service': {
          target: gateway,
          changeOrigin: true,
        },
        '/user-service': {
          target: gateway,
          changeOrigin: true,
        },
      },
    },
  }
})
