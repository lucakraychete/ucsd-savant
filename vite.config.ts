import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
  // CHANGE THIS in step 3 to '/<your-repo-name>/'
  base: '/',
  build: { outDir: 'dist' },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } }
})
