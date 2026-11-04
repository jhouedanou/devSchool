import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// « @tp » pointe vers le dossier de travail de l'élève (exercices/).
// Avec « --mode solution », il pointe vers les solutions (solutions/).
// Exemple : npm run solutions  ou  npm run dev:solutions
export default defineConfig(({ mode }) => {
  const dossier = mode === 'solution' ? './solutions' : './exercices'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@tp': fileURLToPath(new URL(dossier, import.meta.url)),
      },
    },
    test: {
      environment: 'happy-dom',
      include: ['tests/**/*.test.js'],
      restoreMocks: true,
      unstubGlobals: true,
    },
  }
})
