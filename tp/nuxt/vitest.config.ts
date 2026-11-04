import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

// Les tests des routes serveur (server/api) construisent l'application
// et démarrent un vrai serveur Nuxt : ce sont des tests « de bout en bout ».
const testsServeur = ['tests/03-api-taches.test.ts']

export default defineConfig({
  test: {
    projects: [
      // Tests de l'application (pages, composants, composables, middleware).
      // Ils tournent dans l'environnement « nuxt » : auto-imports, routeur et useState fonctionnent.
      await defineVitestProject({
        test: {
          name: 'app',
          include: ['tests/*.test.ts'],
          exclude: testsServeur,
          environment: 'nuxt',
          environmentOptions: {
            nuxt: { domEnvironment: 'happy-dom' },
          },
        },
      }),
      // Tests des routes serveur : environnement Node + @nuxt/test-utils/e2e.
      {
        test: {
          name: 'serveur',
          include: testsServeur,
          environment: 'node',
        },
      },
    ],
  },
})
