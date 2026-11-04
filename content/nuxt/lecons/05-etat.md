# Gérer l'état

## Objectifs

- Comprendre pourquoi une `ref` globale est dangereuse avec le SSR.
- Partager un état entre composants avec `useState`.
- Ranger cet état dans un composable.
- Garder une valeur entre deux visites avec `useCookie`.
- Installer et utiliser Pinia dans Nuxt.

## Le problème de la ref globale

Dans une app Vue classique, on partage souvent un état avec une `ref` déclarée hors d'un composant :

```ts
// ✗ Dangereux avec Nuxt
// app/composables/panier.ts
export const panier = ref([])
```

Avec le SSR, **un seul serveur** répond à tous les visiteurs. Cette `ref` vit dans le processus du serveur : elle est donc partagée entre toutes les requêtes. Le visiteur B peut voir le panier du visiteur A, et la mémoire grossit sans arrêt.

Règle : ne déclare jamais `const etat = ref()` en dehors de `<script setup>` ou d'une fonction.

## `useState`

`useState(cle, init)` crée une ref **compatible SSR** :

- sur le serveur, l'état est créé pour la requête en cours seulement ;
- sa valeur est envoyée au navigateur dans le payload, puis réutilisée ;
- tous les composants qui utilisent la même clé partagent la même valeur.

```vue
<script setup lang="ts">
const compteur = useState('compteur', () => 0)
</script>

<template>
  <button @click="compteur++">Clics : {{ compteur }}</button>
</template>
```

La fonction `init` ne sert qu'à la **première** création. Un autre composant qui appelle `useState('compteur')` récupère la valeur existante.

> [!WARNING]
> La valeur est convertie pour voyager du serveur au navigateur. N'y mets ni fonction, ni instance de classe, ni symbole. Garde des données simples : nombres, chaînes, tableaux, objets.

### Ranger l'état dans un composable

Pour ne pas répéter la clé partout, crée un composable. Il est auto-importé.

```ts
// app/composables/usePanier.ts
type Article = { id: number; nom: string; prix: number }

export function usePanier() {
  const articles = useState<Article[]>('panier', () => [])

  const total = computed(() => articles.value.reduce((s, a) => s + a.prix, 0))

  function ajouter(article: Article) {
    articles.value.push(article)
  }

  function vider() {
    articles.value = []
  }

  return { articles, total, ajouter, vider }
}
```

```vue
<!-- app/components/BadgePanier.vue -->
<script setup lang="ts">
const { articles } = usePanier()
</script>

<template>
  <NuxtLink to="/panier">Panier ({{ articles.length }})</NuxtLink>
</template>
```

La page produit appelle `usePanier().ajouter(…)`, et le badge se met à jour.

### Remplir l'état avec des données du serveur

`callOnce()` exécute un code **une seule fois** : sur le serveur au premier affichage, puis plus jamais pendant l'hydratation.

```vue
<!-- app/app.vue -->
<script setup lang="ts">
const config = useState('config')

await callOnce(async () => {
  config.value = await $fetch('/api/config')
})
</script>
```

Pour effacer un état, appelle `clearNuxtState('panier')`.

## `useCookie`

`useState` est perdu quand l'utilisateur recharge la page. Pour garder une petite valeur (thème, langue, jeton), utilise un cookie. `useCookie` renvoie une ref, lisible **sur le serveur et dans le navigateur**.

```vue
<script setup lang="ts">
const theme = useCookie<'clair' | 'sombre'>('theme', {
  default: () => 'clair',
  maxAge: 60 * 60 * 24 * 365,   // un an, en secondes
  sameSite: 'lax',
})

function basculer() {
  theme.value = theme.value === 'clair' ? 'sombre' : 'clair'
}
</script>

<template>
  <button @click="basculer">Thème : {{ theme }}</button>
</template>
```

- Changer `theme.value` écrit le cookie.
- La valeur est convertie en JSON automatiquement : tu peux stocker un petit objet.
- Comme le serveur lit le cookie, le bon thème est déjà dans le HTML. Pas de clignotement ni d'erreur d'hydratation.

> [!TIP]
> Évite `localStorage` dans `setup` : il n'existe pas sur le serveur. Un cookie fait le même travail et marche en SSR.

## Pinia

Pinia est la bibliothèque de stores officielle de Vue. Choisis-la pour un état riche, avec beaucoup d'actions, ou si ton équipe la connaît déjà.

```bash
npx nuxt module add pinia
```

Cette commande installe `pinia` et `@pinia/nuxt`, et ajoute le module dans la configuration :

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
})
```

Les stores de `app/stores/` sont auto-importés, comme `defineStore` et `storeToRefs`.

```ts
// app/stores/panier.ts
export const usePanierStore = defineStore('panier', () => {
  const articles = ref<{ id: number; prix: number }[]>([])
  const total = computed(() => articles.value.reduce((s, a) => s + a.prix, 0))

  function ajouter(article: { id: number; prix: number }) {
    articles.value.push(article)
  }

  return { articles, total, ajouter }
})
```

```vue
<script setup lang="ts">
const panier = usePanierStore()
const { articles, total } = storeToRefs(panier)   // garde la réactivité
</script>

<template>
  <p>{{ articles.length }} article(s), {{ total }} €</p>
  <button @click="panier.ajouter({ id: 1, prix: 4 })">Ajouter</button>
</template>
```

Le module gère le SSR : l'état des stores est créé par requête et transmis au navigateur. Ici, une `ref` **dans** `defineStore` ne pose pas de problème, car le store est créé pour chaque requête.

Pour remplir un store au chargement, combine-le avec `callOnce` :

```ts
const utilisateur = useUtilisateurStore()
await callOnce('utilisateur', () => utilisateur.charger())
```

## Que choisir ?

| Besoin | Outil |
|--------|-------|
| État d'un seul composant | `ref` dans `<script setup>` |
| Petit état partagé (panier, utilisateur, filtres) | `useState` dans un composable |
| Valeur gardée après un rechargement | `useCookie` |
| Gros état, beaucoup d'actions, DevTools Pinia | Pinia (`@pinia/nuxt`) |
| Données venues d'une API | `useFetch` / `useAsyncData` (voir [la leçon sur les données](#/nuxt/lecon/04-donnees)) |

## Pièges fréquents

- **`ref` au niveau du module.** Elle est partagée entre tous les visiteurs du serveur. Utilise `useState`.
- **Deux clés pour le même état.** `useState('panier')` et `useState('Panier')` sont deux états différents. Centralise la clé dans un composable.
- **Même clé pour deux états différents.** Ils s'écrasent. Choisis des clés précises.
- **Valeur non sérialisable.** Une fonction ou une instance de classe dans `useState` provoque une erreur au transfert vers le navigateur.
- **Déstructurer un store Pinia.** `const { total } = usePanierStore()` perd la réactivité. Utilise `storeToRefs()` pour l'état, et appelle les actions sur le store.
- **`localStorage` dans `setup`.** Plante côté serveur. Utilise `useCookie` ou `onMounted()`.

## Résumé

- Une `ref` hors d'un composant est partagée entre toutes les requêtes du serveur : à éviter.
- `useState(cle, init)` crée un état partagé, créé par requête et transmis au navigateur.
- Range `useState` dans un composable de `app/composables/`.
- `useCookie` garde une valeur entre deux visites et marche côté serveur.
- Pinia s'installe avec `npx nuxt module add pinia`. Ses stores vont dans `app/stores/`.

## Pour pratiquer

Fais [l'exercice « Un panier partagé avec useState »](#/nuxt/exercice/05-panier-partage), puis [le TP « État partagé avec useState »](#/nuxt/tp/05-etat-panier).
