// Configuration de Nuxt : https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/principal.css'],
  app: {
    head: {
      title: 'TP Nuxt',
      htmlAttrs: { lang: 'fr' },
    },
  },
  typescript: {
    // Donne aux fichiers de tests/ les mêmes types que l'application (#imports, ~/…).
    tsConfig: { include: ['../tests/**/*'] },
  },
})
