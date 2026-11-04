# Récupérer des données

## Objectifs

- Comprendre pourquoi `$fetch` seul dans `setup` fait une double requête.
- Charger des données avec `useFetch` et `useAsyncData`.
- Gérer le chargement, les erreurs et le rafraîchissement avec `status`, `error` et `refresh`.
- Rendre une requête réactive et réduire les données avec `transform` et `pick`.
- Choisir entre `useFetch`, `useAsyncData` et `$fetch`.

## Le problème : la double requête

En SSR, le `setup` de ta page tourne **deux fois** : sur le serveur (pour produire le HTML), puis dans le navigateur (pendant l'hydratation).

```vue
<script setup lang="ts">
// ✗ À éviter : la requête part sur le serveur, PUIS encore dans le navigateur.
const produits = ref([])
produits.value = await $fetch('/api/produits')
</script>
```

`useFetch` et `useAsyncData` règlent ce problème. Ils font la requête sur le serveur et rangent le résultat dans le **payload** : des données envoyées avec le HTML. Dans le navigateur, Nuxt relit le payload au lieu de refaire la requête.

```vue
<script setup lang="ts">
// ✓ Une seule requête, côté serveur. Le navigateur réutilise le résultat.
const { data: produits } = await useFetch('/api/produits')
</script>
```

## `useFetch`

`useFetch(url, options)` est la façon la plus simple de charger des données dans une page ou un composant.

```vue
<script setup lang="ts">
type Produit = { id: number; nom: string; prix: number }

const { data: produits, status, error, refresh } = await useFetch<Produit[]>('/api/produits')
</script>

<template>
  <div>
    <p v-if="status === 'pending'">Chargement…</p>
    <p v-else-if="error">Erreur {{ error.status }}</p>
    <ul v-else>
      <li v-for="produit in produits" :key="produit.id">{{ produit.nom }}</li>
    </ul>
    <button @click="refresh()">Actualiser</button>
  </div>
</template>
```

Pour une route de ton dossier `server/api/`, le type est souvent déduit tout seul : Nuxt lit ce que renvoie le handler.

### Les valeurs renvoyées

| Valeur | Rôle |
|--------|------|
| `data` | les données (une ref) |
| `status` | `'idle'`, `'pending'`, `'success'` ou `'error'` |
| `error` | l'erreur si la requête échoue |
| `refresh()` / `execute()` | relance la requête |
| `clear()` | remet `data` à sa valeur par défaut, vide `error` et passe `status` à `'idle'` |
| `pending` | `true` pendant le chargement (préfère `status`) |

> [!NOTE]
> **Changements en Nuxt 4.**
> - `data` et `error` valent `undefined` par défaut (avant : `null`). Remplace tes tests `=== null`.
> - `data` est une `shallowRef` : modifier une propriété imbriquée (`data.value.items.push(x)`) ne met pas l'affichage à jour. Remplace la valeur entière, ou passe `deep: true`.
> - `pending` vaut `true` seulement quand `status` vaut `'pending'`.
> - Deux appels avec la même clé partagent les mêmes `data`, `error` et `status`.

### Le `await`

Avec `await`, la suite du `setup` attend les données. Lors d'une navigation dans le navigateur, la page s'affiche quand les données sont prêtes. Sans `await`, la page s'affiche tout de suite et `data` se remplit plus tard : tu gères alors l'état de chargement avec `status`.

## Les options

```ts
const { data } = await useFetch('/api/produits', {
  method: 'GET',
  query: { page: 1 },          // → /api/produits?page=1
  headers: { 'X-Version': '2' },
  key: 'liste-produits',       // clé du cache (sinon Nuxt en calcule une)
  default: () => [],           // valeur de data avant (ou sans) réponse
  lazy: false,                 // true : ne bloque pas la navigation
  server: true,                // false : requête seulement dans le navigateur
  immediate: true,             // false : attend un appel à execute()
  transform: (r) => r,         // modifie la réponse avant de la ranger
  pick: ['id', 'nom'],         // garde seulement ces champs
  watch: [],                   // sources qui relancent la requête
})
```

### Une requête réactive

Si l'URL ou une option dépend d'une valeur réactive, Nuxt relance la requête quand elle change.

```ts
const recherche = ref('')
const page = ref(1)

// Une ref dans query : la requête suit sa valeur.
const { data } = await useFetch('/api/produits', {
  query: { q: recherche, page },
})

// Une URL calculée : passe une fonction (getter).
const id = ref(1)
const { data: produit } = await useFetch(() => `/api/produits/${id.value}`)
```

Une option `computed` marche aussi : `query: computed(() => ({ q: recherche.value }))`.

> [!WARNING]
> `query: { q: recherche.value }` n'est **pas** réactif : `.value` lit la valeur une seule fois, à l'appel. Passe la ref elle-même, un `computed` ou une fonction.

Pour relancer sur un autre signal, utilise `watch: [source]`. Pour désactiver le suivi automatique, mets `watch: false`.

### `transform` et `pick`

L'API renvoie souvent plus que nécessaire. `transform` reformate la réponse, `pick` garde quelques champs.

```ts
const { data: produits } = await useFetch('/api/produits', {
  transform: (reponse: { total: number; produits: Produit[] }) => reponse.produits,
  default: () => [],
})

const { data: auteur } = await useFetch('/api/auteurs/1', {
  pick: ['nom', 'avatar'],
})
```

Ces options ne réduisent pas le téléchargement depuis l'API. Elles réduisent le **payload** envoyé au navigateur avec le HTML.

### `lazy` : ne pas bloquer la navigation

Avec `lazy: true` (ou `useLazyFetch`), la navigation ne bloque pas. La page s'affiche tout de suite, et tu montres un état de chargement.

```vue
<script setup lang="ts">
const { data: avis, status } = useLazyFetch('/api/avis')
</script>

<template>
  <p v-if="status === 'pending'">Chargement des avis…</p>
  <ul v-else>
    <li v-for="a in avis" :key="a.id">{{ a.texte }}</li>
  </ul>
</template>
```

## `useAsyncData`

`useAsyncData(cle, fonction)` exécute **ta** fonction asynchrone, avec les mêmes avantages que `useFetch` (une seule exécution, payload, `status`…). Utilise-le quand tu n'appelles pas une simple URL : un SDK, plusieurs requêtes, un calcul.

```ts
const { data } = await useAsyncData('tableau-de-bord', async () => {
  const [ventes, clients] = await Promise.all([
    $fetch('/api/ventes'),
    $fetch('/api/clients'),
  ])
  return { ventes, clients }
})
```

`useFetch(url)` est presque un raccourci de `useAsyncData(cle, () => $fetch(url))`.

Donne une clé claire et unique. Avec une clé, d'autres composants retrouvent les données : `useNuxtData('tableau-de-bord')` les lit, `refreshNuxtData('tableau-de-bord')` les recharge.

La fonction reçoit aussi un `signal` pour annuler la requête si elle n'est plus utile :

```ts
const { data } = await useAsyncData('produits', (_nuxtApp, { signal }) =>
  $fetch('/api/produits', { signal }),
)
```

## `$fetch`

`$fetch` fait une requête HTTP simple. Il convertit le corps en JSON, lit la réponse JSON et lève une erreur si le statut n'est pas 2xx. Utilise-le pour les **actions** de l'utilisateur : un clic, un envoi de formulaire.

```ts
const { data: taches, refresh } = await useFetch('/api/taches')
const erreur = ref('')

async function ajouter(titre: string) {
  erreur.value = ''
  try {
    await $fetch('/api/taches', { method: 'POST', body: { titre } })
    await refresh()
  } catch {
    erreur.value = 'Impossible d\'ajouter la tâche.'
  }
}
```

En cas d'échec, `$fetch` lève une erreur : `e.status` contient le code HTTP et `e.data` le corps JSON de la réponse.

> [!TIP]
> Côté serveur, `useFetch` transmet les cookies de l'utilisateur aux routes de ton API. Un `$fetch` seul ne le fait pas. Si tu en as besoin, utilise `useRequestFetch()`.

## Quelle fonction choisir ?

| Situation | Choix |
|-----------|-------|
| Charger les données d'une page depuis une URL | `useFetch` |
| Charger avec ta propre fonction (SDK, plusieurs appels) | `useAsyncData` |
| Données secondaires, la page peut s'afficher sans | `useLazyFetch` / `lazy: true` |
| Envoyer un formulaire, réagir à un clic | `$fetch` |
| Appeler une API depuis une route serveur | `$fetch` |

## Pièges fréquents

- **`$fetch` seul dans `setup`.** La requête part deux fois (serveur puis navigateur). Utilise `useFetch`.
- **`useFetch` dans un gestionnaire de clic.** C'est un composable : il s'appelle dans `setup`. Pour une action, utilise `$fetch`, puis `refresh()`.
- **`query: { q: recherche.value }`.** La valeur est lue une seule fois. Passe la ref, un `computed` ou une fonction.
- **Tester `data.value === null`.** En Nuxt 4, la valeur par défaut est `undefined`. Écris `if (!data.value)`.
- **Modifier une propriété imbriquée de `data`.** `data` est une `shallowRef` : réassigne `data.value` ou ajoute `deep: true`.
- **Même clé, options différentes.** Deux appels avec la même `key` partagent l'état : garde les mêmes `transform`, `pick` et `default`.
- **Croire que `pick` allège l'appel à l'API.** Il allège seulement le payload envoyé au navigateur.

## Résumé

- `useFetch` et `useAsyncData` chargent une fois sur le serveur et transmettent le résultat au navigateur (payload).
- Ils renvoient `data`, `status`, `error`, `refresh`, `clear`. En Nuxt 4, `data` et `error` valent `undefined` par défaut.
- Une ref, un `computed` ou une fonction dans l'URL ou dans `query` rend la requête réactive.
- `transform` et `pick` réduisent le payload, `default` donne une valeur de départ, `lazy` ne bloque pas la navigation.
- `$fetch` sert aux actions de l'utilisateur et au code serveur.

## Pour pratiquer

Fais [l'exercice « Charger et ajouter des tâches »](#/nuxt/exercice/04-liste-taches), puis [l'exercice « Une recherche réactive »](#/nuxt/exercice/04-recherche-produits). Ensuite, fais [le TP « Afficher les tâches avec useFetch »](#/nuxt/tp/04-usefetch-taches).
