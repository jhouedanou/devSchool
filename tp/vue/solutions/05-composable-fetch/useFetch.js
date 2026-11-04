import { ref, toValue, watchEffect } from 'vue'

/**
 * Charge des données JSON depuis une URL.
 *
 * @param url une chaîne, un ref ou un getter (() => props.url).
 * @returns { data, error, loading, refresh }
 */
export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)

  async function refresh() {
    // toValue() lit la valeur, que « url » soit une chaîne, un ref ou un getter.
    const adresse = toValue(url)

    data.value = null
    error.value = null
    loading.value = true

    try {
      const reponse = await fetch(adresse)
      // fetch() ne lève pas d'erreur pour un statut 404 ou 500 : on vérifie « ok ».
      if (!reponse.ok) throw new Error(`Erreur HTTP ${reponse.status}`)
      data.value = await reponse.json()
    } catch (e) {
      error.value = e
    } finally {
      loading.value = false
    }
  }

  // watchEffect lance refresh() tout de suite. Il suit les refs lus avant
  // le premier « await » : ici l'URL. Si elle change, la requête repart.
  watchEffect(() => {
    refresh()
  })

  return { data, error, loading, refresh }
}
