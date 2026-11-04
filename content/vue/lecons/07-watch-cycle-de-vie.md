# Watchers et cycle de vie

## Objectifs

- Lancer un effet quand une valeur change avec `watch` et `watchEffect`.
- Utiliser les options `deep`, `immediate` et `once`.
- Agir au montage et au démontage avec `onMounted` / `onUnmounted`, et faire le ménage.
- Accéder à un élément du DOM avec `useTemplateRef`.
- Attendre la mise à jour du DOM avec `nextTick`.

## watch : réagir à un changement

`computed` calcule une valeur. `watch` lance une **action** (un effet de bord) quand une valeur change : appeler une API, écrire dans `localStorage`, changer le titre de la page…

```js
import { ref, watch } from 'vue'

const recherche = ref('')

watch(recherche, (nouvelle, ancienne) => {
  console.log(`"${ancienne}" → "${nouvelle}"`)
})
```

Le premier argument est la **source** à surveiller. Le callback reçoit la nouvelle et l'ancienne valeur.

### Les sources possibles

```js
const x = ref(0)
const user = reactive({ nom: 'Ada', age: 36 })

watch(x, (n) => {})                          // une ref
watch(() => user.age, (age) => {})           // un getter (fonction)
watch(() => x.value + user.age, (s) => {})   // une expression calculée
watch([x, () => user.nom], ([n, nom]) => {}) // plusieurs sources
watch(user, (u) => {})                       // un objet reactive (profond)
```

> [!WARNING]
> `watch(user.age, ...)` ne marche pas : `user.age` est un simple nombre. Passe un getter : `watch(() => user.age, ...)`.

### Les options

```js
watch(source, callback, {
  immediate: true, // lance le callback tout de suite, puis à chaque changement
  deep: true,      // surveille aussi les propriétés imbriquées
  once: true,      // se déclenche une seule fois, puis s'arrête
})
```

- **immediate** : utile pour charger des données au démarrage et à chaque changement.
- **deep** : une ref qui contient un objet ne déclenche le watcher que si on remplace l'objet. Avec `deep: true`, une modification interne (`panier.value[0].quantite++`) le déclenche aussi. Depuis Vue 3.5, `deep` accepte un nombre : la profondeur maximale.
- **once** (Vue 3.4+) : pour un effet à faire une seule fois.

```js
const panier = ref(JSON.parse(localStorage.getItem('panier') ?? '[]'))

watch(panier, (valeur) => {
  localStorage.setItem('panier', JSON.stringify(valeur))
}, { deep: true })
```

> [!NOTE]
> Un watcher sur un objet `reactive` est profond automatiquement. Avec `deep`, l'ancienne et la nouvelle valeur sont le même objet si seul l'intérieur a changé.

## watchEffect : suivi automatique

`watchEffect` exécute la fonction **tout de suite**, puis la relance dès qu'une valeur réactive lue dedans change. Pas besoin de lister les sources.

```js
import { ref, watchEffect } from 'vue'

const id = ref(1)
const article = ref(null)

watchEffect(async () => {
  const reponse = await fetch(`/api/articles/${id.value}`)
  article.value = await reponse.json()
})
```

> [!WARNING]
> Avec une fonction `async`, Vue suit seulement les valeurs lues **avant le premier `await`**. Ici `id.value` est lu avant : c'est bon. Une ref lue après l'`await` ne relancera pas l'effet.

| | `watch` | `watchEffect` |
|---|---|---|
| Sources | listées explicitement | détectées automatiquement |
| Premier appel | au premier changement (ou `immediate`) | tout de suite |
| Ancienne valeur | oui | non |

## Arrêter un watcher

Un watcher créé dans `<script setup>` s'arrête tout seul quand le composant est démonté. Pour l'arrêter avant, garde la fonction retournée :

```js
const arreter = watch(source, callback)
// plus tard
arreter()
```

Depuis Vue 3.5, cette valeur a aussi `pause()` et `resume()`.

> [!WARNING]
> Un watcher créé plus tard, par exemple dans un `setTimeout`, n'est pas lié au composant. Tu dois l'arrêter toi-même.

## Nettoyer un effet

Quand la source change vite (frappe dans une recherche), une ancienne requête peut répondre **après** la nouvelle. Le nettoyage annule l'effet précédent. Depuis Vue 3.5, utilise `onWatcherCleanup` :

```js
import { ref, watch, onWatcherCleanup } from 'vue'

const recherche = ref('')
const resultats = ref([])

watch(recherche, async (texte) => {
  const controleur = new AbortController()
  onWatcherCleanup(() => controleur.abort()) // appelé avant la prochaine exécution

  const reponse = await fetch(`/api/produits?q=${texte}`, { signal: controleur.signal })
  resultats.value = await reponse.json()
})
```

> [!IMPORTANT]
> Appelle `onWatcherCleanup()` **avant** le premier `await`. Avant Vue 3.5, on utilisait le troisième argument du callback : `watch(src, (n, a, onCleanup) => { onCleanup(() => …) })`. Il marche toujours.

## Le cycle de vie d'un composant

Un composant passe par des étapes : création, montage dans le DOM, mises à jour, démontage. Des fonctions (**hooks**) permettent d'agir à chaque étape.

| Étape | Hook | Usage courant |
|-------|------|---------------|
| Création | le code de `<script setup>` lui-même | initialiser l'état |
| Avant le montage | `onBeforeMount` | rarement utile |
| Monté dans le DOM | `onMounted` | accéder au DOM, lancer un timer, une bibliothèque |
| Après une mise à jour | `onUpdated` | rarement utile |
| Avant le démontage | `onBeforeUnmount` | ménage |
| Démonté | `onUnmounted` | ménage : timers, écouteurs |

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const largeur = ref(window.innerWidth)

function mesurer() {
  largeur.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', mesurer)
})

onUnmounted(() => {
  window.removeEventListener('resize', mesurer)
})
</script>

<template>
  <p>Largeur de la fenêtre : {{ largeur }} px</p>
</template>
```

> [!IMPORTANT]
> Tout ce que tu démarres dans `onMounted` (`setInterval`, `addEventListener`, abonnement) doit être arrêté dans `onUnmounted`. Sinon, le code continue de tourner après la disparition du composant : c'est une **fuite de mémoire**.

> [!NOTE]
> Correspondance avec Vue 2 : `created` → le code de `<script setup>`, `mounted` → `onMounted`, `beforeDestroy` → `onBeforeUnmount`, `destroyed` → `onUnmounted`.

## useTemplateRef : accéder au DOM

Parfois, tu as besoin de l'élément DOM lui-même : donner le focus, mesurer une taille, brancher une bibliothèque. Ajoute un attribut `ref="nom"` et récupère-le avec `useTemplateRef('nom')` (Vue 3.5).

```vue
<script setup>
import { useTemplateRef, onMounted } from 'vue'

const champ = useTemplateRef('champ-recherche')

onMounted(() => {
  champ.value.focus()
})
</script>

<template>
  <input ref="champ-recherche" placeholder="Rechercher…" />
</template>
```

- La valeur est `null` tant que l'élément n'est pas monté (ou s'il est caché par un `v-if`).
- Sur un composant enfant, tu obtiens son instance. L'enfant choisit ce qu'il montre avec `defineExpose({ ... })`.
- Dans un `v-for`, la ref contient un **tableau** d'éléments.

> [!NOTE]
> Avant Vue 3.5, on écrivait `const champ = ref(null)` avec le même nom que l'attribut `ref="champ"`. Tu le verras souvent dans du code existant.

## nextTick : attendre la mise à jour du DOM

Quand tu changes l'état, Vue ne met pas à jour le DOM tout de suite. Il regroupe les changements et les applique un peu plus tard, en une fois. `nextTick()` attend cette mise à jour.

```vue
<script setup>
import { ref, useTemplateRef, nextTick } from 'vue'

const edition = ref(false)
const champ = useTemplateRef('champ')

async function modifier() {
  edition.value = true
  // ici, l'<input> n'existe pas encore
  await nextTick()
  champ.value.focus() // maintenant il existe
}
</script>

<template>
  <input v-if="edition" ref="champ" />
  <button v-else @click="modifier">Modifier</button>
</template>
```

## Pièges fréquents

- **Utiliser `watch` pour calculer une valeur** : si c'est une valeur dérivée, un `computed` est plus simple.
- **`watch(objet.propriete, ...)`** : passe un getter, `watch(() => objet.propriete, ...)`.
- **Oublier `deep: true`** sur une ref qui contient un objet modifié de l'intérieur.
- **Lire une ref après le premier `await`** dans `watchEffect` : elle n'est pas suivie.
- **Ne pas nettoyer** un `setInterval` ou un `addEventListener` dans `onUnmounted`.
- **Lire `champ.value` trop tôt** : avant `onMounted` ou juste après un changement de `v-if`, l'élément n'existe pas. Utilise `onMounted` ou `await nextTick()`.

## Résumé

- `watch(source, (nouvelle, ancienne) => …)` lance un effet quand la source change. Source : ref, getter, tableau ou reactive.
- Options : `immediate` (tout de suite), `deep` (profond, ou un nombre en 3.5), `once` (une seule fois).
- `watchEffect` suit automatiquement les valeurs lues et s'exécute tout de suite.
- `onWatcherCleanup()` (3.5) annule l'effet précédent, par exemple une requête.
- `onMounted` pour accéder au DOM ; `onUnmounted` pour faire le ménage.
- `useTemplateRef('nom')` + `ref="nom"` donne l'élément DOM.
- `await nextTick()` attend que le DOM reflète le nouvel état.

## Pour pratiquer

Fais l'exercice [Un minuteur propre](#/vue/exercice/07-minuteur) (watch, onMounted, onUnmounted), puis [Titre modifiable](#/vue/exercice/07-edition-focus) (useTemplateRef, nextTick). Le TP [Composable useFetch](#/vue/tp/05-composable-fetch), après la leçon 8, utilise aussi un watcher.
