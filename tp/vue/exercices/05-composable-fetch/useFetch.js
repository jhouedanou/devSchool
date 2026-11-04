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
    // TODO 1 : lis l'URL avec toValue(url). Fais-le AVANT le premier await :
    //          c'est ce qui permet à watchEffect de suivre l'URL.

    // TODO 2 : remets data et error à null, puis passe loading à true.

    // TODO 3 : dans un try / catch / finally :
    //   - appelle fetch(adresse) ;
    //   - si la réponse n'est pas « ok » (404, 500…), lève une Error ;
    //   - sinon, mets le résultat de reponse.json() dans data ;
    //   - en cas d'erreur, mets-la dans error ;
    //   - à la fin (finally), repasse loading à false.
  }

  // TODO 4 : appelle refresh() dans un watchEffect.
  //          La requête part tout de suite, puis à chaque changement d'URL.

  return { data, error, loading, refresh }
}
