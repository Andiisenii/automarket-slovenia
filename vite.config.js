import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: ['fzjnl-45-156-143-215.run.pinggy-free.link', 'punuw-45-156-143-215.run.pinggy-free.link', 'localhost', '127.0.0.1'],
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Copy all headers from the original request
            Object.keys(req.headers).forEach(key => {
              proxyReq.setHeader(key, req.headers[key])
            })
          })
        }
      }
    }
  }
})
