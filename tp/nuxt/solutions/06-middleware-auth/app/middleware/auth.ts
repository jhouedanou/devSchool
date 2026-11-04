// Middleware nommé : il ne s'exécute que sur les pages qui le demandent avec definePageMeta.
export default defineNuxtRouteMiddleware(() => {
  const { estConnecte } = useAuth()

  if (!estConnecte.value) {
    return navigateTo('/connexion')
  }
})
