# Les composables

## Objectifs

- Comprendre ce qu'est un composable et quand en écrire un.
- Respecter la convention `useXxx` et retourner des refs.
- Accepter une ref, un getter ou une valeur avec `toValue()`.
- Écrire `useCompteur`, `useFetch` et `useLocalStorage`.

## Qu'est-ce qu'un composable ?

Un **composable** est une fonction qui utilise la Composition API (`ref`, `computed`, `watch`, hooks…) pour regrouper une logique **avec état** et la réutiliser.

- Son nom commence par `use` : `useCompteur`, `useFetch`, `useSouris`.
- On le range dans `src/composables/useXxx.js`.
- On l'appelle dans `<script setup>`.

> [!NOTE]
> En Vue 2, on partageait la logique avec des **mixins**. Problèmes : on ne savait pas d'où venait une propriété, et deux mixins pouvaient utiliser le même nom. Les composables règlent cela : tu vois ce que tu importes et tu peux renommer à la déstructuration.

## Un premier composable : useCompteur

```js
// src/composables/useCompteur.js
import { ref, computed } from 'vue'

export function useCompteur(initial = 0, { min = -Infinity, max = Infinity } = {}) {
  const compte = ref(initial)

  const auMax = computed(() => compte.value >= max)
  const auMin = computed(() => compte.value <= min)

  function incrementer() {
    if (!auMax.value) compte.value++
  }
  function decrementer() {
    if (!auMin.value) compte.value--
  }

  return { compte, auMin, auMax, incrementer, decrementer }
}
```

```vue
<script setup>
import { useCompteur } from '@/composables/useCompteur'

const { compte, auMax, incrementer } = useCompteur(0, { max: 10 })
</script>

<template>
  <button :disabled="auMax" @click="incrementer">{{ compte }}</button>
</template>
```

Chaque appel crée un **nouvel** état. Deux composants qui appellent `useCompteur()` ont chacun leur compteur.

## Retourner des refs

Retourne un objet simple qui contient des refs, pas un `reactive`. Le composant peut alors **déstructurer** sans perdre la réactivité, et renommer :

```js
const { compte: billets, incrementer: ajouterBillet } = useCompteur(1)
const { compte: bagages } = useCompteur(0)
```

Si tu préfères écrire `compteur.compte` dans le template, enveloppe le résultat dans `reactive()` : les refs seront déballées.

```js
const compteur = reactive(useCompteur())
compteur.compte // pas de .value
```

> [!TIP]
> Si un état ne doit pas être modifié de l'extérieur, retourne-le avec `readonly()` et propose des fonctions pour le changer.

## Accepter une ref ou un getter : toValue()

Un composable plus souple accepte une valeur simple, une ref **ou** un getter. `toValue()` (Vue 3.3+) lit la valeur dans tous les cas :

```js
import { toValue } from 'vue'

toValue(5)           // 5
toValue(ref(5))      // 5
toValue(() => 2 + 3) // 5
```

Pour que le composable réagisse quand l'argument change, appelle `toValue()` **dans** un `watchEffect` (ou un `watch` avec un getter). Vue suit alors la ref lue.

## Exemple : useFetch

```js
// src/composables/useFetch.js
import { ref, watchEffect, toValue } from 'vue'

export function useFetch(url) {
  const donnees = ref(null)
  const erreur = ref(null)
  const chargement = ref(false)

  watchEffect(async () => {
    const adresse = toValue(url) // lu avant le premier await : suivi
    erreur.value = null
    chargement.value = true
    try {
      const reponse = await fetch(adresse)
      if (!reponse.ok) throw new Error(`Erreur ${reponse.status}`)
      donnees.value = await reponse.json()
    } catch (e) {
      erreur.value = e.message
    } finally {
      chargement.value = false
    }
  })

  return { donnees, erreur, chargement }
}
```

```vue
<script setup>
import { ref } from 'vue'
import { useFetch } from '@/composables/useFetch'

const page = ref(1)
const { donnees: articles, erreur, chargement } = useFetch(
  () => `/api/articles?page=${page.value}`,
)
</script>

<template>
  <p v-if="chargement">Chargement…</p>
  <p v-else-if="erreur">{{ erreur }}</p>
  <ul v-else-if="articles">
    <li v-for="a in articles" :key="a.id">{{ a.titre }}</li>
  </ul>
  <button @click="page++">Page suivante</button>
</template>
```

Le getter lit `page.value`. Quand `page` change, `watchEffect` relance la requête.

> [!WARNING]
> `useFetch(\`/api/articles?page=${page.value}\`)` passe une **chaîne** calculée une seule fois. Le composable ne verra jamais le changement de page. Passe un getter : `() => \`...\``.

> [!NOTE]
> `fetch` ne lève pas d'erreur pour un statut 404 ou 500. Vérifie toujours `reponse.ok`.

## Exemple : useLocalStorage

Ce composable garde une valeur dans `localStorage`, pour la retrouver au rechargement de la page.

```js
// src/composables/useLocalStorage.js
import { ref, watch } from 'vue'

export function useLocalStorage(cle, valeurInitiale) {
  const enregistre = localStorage.getItem(cle)
  const valeur = ref(enregistre !== null ? JSON.parse(enregistre) : valeurInitiale)

  watch(valeur, (nouvelle) => {
    localStorage.setItem(cle, JSON.stringify(nouvelle))
  }, { deep: true })

  return valeur
}
```

```js
const theme = useLocalStorage('theme', 'clair')
const favoris = useLocalStorage('favoris', [])

favoris.value.push(42) // enregistré grâce à deep: true
```

## Un composable avec des hooks

Un composable peut utiliser `onMounted` et `onUnmounted`. Ces hooks s'attachent au composant **qui appelle** le composable.

```js
// src/composables/useSouris.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useSouris() {
  const x = ref(0)
  const y = ref(0)

  function suivre(event) {
    x.value = event.pageX
    y.value = event.pageY
  }

  onMounted(() => window.addEventListener('mousemove', suivre))
  onUnmounted(() => window.removeEventListener('mousemove', suivre))

  return { x, y }
}
```

Le composant n'a plus à penser au ménage : le composable s'en occupe.

> [!IMPORTANT]
> Appelle un composable **au premier niveau** de `<script setup>`, pas dans un gestionnaire de clic ni dans un `setTimeout`. Sinon, ses hooks et ses watchers ne sont pas liés au composant.

## État partagé entre composants

Une ref déclarée **en dehors** de la fonction est créée une seule fois, au chargement du module. Tous les composants partagent alors le même état :

```js
// src/composables/useNotifications.js
import { ref, readonly } from 'vue'

const messages = ref([]) // partagé par toute l'application

export function useNotifications() {
  function notifier(texte) {
    messages.value.push({ id: Date.now(), texte })
  }
  return { messages: readonly(messages), notifier }
}
```

Cela marche pour des cas simples. Pour un vrai état global (panier, utilisateur), Pinia ajoute les DevTools et le support du rendu serveur (leçon 10).

> [!TIP]
> La bibliothèque **VueUse** propose plus de 200 composables prêts à l'emploi (`useLocalStorage`, `useMouse`, `useDebounceFn`…). Regarde son code : c'est une bonne source d'exemples.

## Pièges fréquents

- **Créer la ref en dehors de la fonction** par erreur : tous les composants partagent alors le même état.
- **Retourner un `reactive`** : la déstructuration casse la réactivité. Retourne un objet de refs.
- **Passer `page.value` au lieu de la ref ou d'un getter** : le composable reçoit une valeur figée.
- **Appeler `toValue(url)` en dehors d'un effet** : le composable lit l'URL une fois et ne réagit plus.
- **Appeler un composable dans une fonction appelée plus tard** (clic, timer) : ses hooks ne marchent pas.
- **Oublier le ménage** dans un composable qui ajoute un écouteur ou un timer.

## Résumé

- Un composable est une fonction `useXxx` qui regroupe une logique avec état (refs, computed, watch, hooks).
- Chaque appel crée un nouvel état ; un état déclaré hors de la fonction est partagé.
- Retourne un objet de refs : le composant peut déstructurer et renommer.
- `toValue()` accepte une valeur, une ref ou un getter. Appelle-le dans un `watchEffect` pour réagir aux changements.
- Les hooks utilisés dans un composable s'attachent au composant appelant.
- Appelle les composables au premier niveau de `<script setup>`.

## Pour pratiquer

Fais l'exercice [Mon premier composable : useCompteur](#/vue/exercice/08-use-compteur), puis [Un composable useFetch](#/vue/exercice/08-use-fetch). Le TP [Composable useFetch](#/vue/tp/05-composable-fetch) va plus loin, dans un vrai projet avec Vitest.
