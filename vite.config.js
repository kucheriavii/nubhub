import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { apiMiddleware } from './server/apiPlugin.js'

export default defineConfig({
  plugins: [react(), apiMiddleware()],
})
