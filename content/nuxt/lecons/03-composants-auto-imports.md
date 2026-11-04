# Composants et auto-imports

## Objectifs

- Savoir ce que Nuxt importe automatiquement, et d'où.
- Prévoir le nom d'un composant d'après son chemin.
- Charger un composant plus tard avec le préfixe `Lazy`.
- Rendre un composant seulement dans le navigateur (`<ClientOnly>`, `.client.vue`).
- Ranger ton code dans `app/composables/`, `app/utils/` et `shared/utils/`.

## Les auto-imports

Un **auto-import** est une fonction ou un composant que tu utilises sans écrire `import`. Nuxt repère ce que tu utilises et ajoute l'import au build. Le code inutilisé n'est pas inclus.

```vue
<script setup lang="ts">
// Aucun import : ref, computed, useFetch et formatPrix sont auto-importés.
const quantite = ref(1)
const { data: produit } = await useFetch('/api/produits/1')
const total = computed(() => quantite.value * (produit.value?.prix ?? 0))
</script>

<template>
  <AppHeader />
  <p>{{ formatPrix(total) }}</p>
</template>
```

| Ce qui est importé | D'où | Disponible dans |
|--------------------|------|-----------------|
| API de Vue (`ref`, `computed`, `watch`, `onMounted`…) | Vue | l'app |
| Composables de Nuxt (`useFetch`, `useState`, `useRoute`, `navigateTo`…) | Nuxt | l'app |
| Tes composants | `app/components/` | l'app |
| Tes composables | `app/composables/` | l'app |
| Tes fonctions utilitaires | `app/utils/` | l'app |
| Code commun | `shared/utils/`, `shared/types/` | l'app **et** le serveur |
| Helpers serveur | `server/utils/` | le serveur seulement |

Nuxt génère les types dans `.nuxt/`. Ton éditeur connaît donc ces fonctions, à condition que `nuxt dev` ou `nuxt prepare` ait tourné.

Tu peux aussi importer explicitement : `import { ref, computed } from '#imports'` pour les fonctions, `import { AppHeader } from '#components'` pour les composants.

## Les composants

Un fichier de `app/components/` devient un composant global, utilisable dans tous les templates.

```text
app/components/
├─ AppHeader.vue              → <AppHeader />
├─ base/
│  ├─ BaseButton.vue          → <BaseButton />
│  └─ foo/
│     └─ Button.vue           → <BaseFooButton />
├─ (formulaires)/
│  └─ Champ.vue               → <Champ />
└─ Commentaires.client.vue    → <Commentaires />  (navigateur seulement)
```

Les règles :

- Le nom vient des dossiers puis du fichier : `base/foo/Button.vue` donne `BaseFooButton`.
- Les morceaux répétés sont retirés : `base/BaseButton.vue` donne `BaseButton`, pas `BaseBaseButton`.
- Un dossier entre parenthèses, comme `(formulaires)/`, n'entre pas dans le nom.
- Les noms en kebab-case passent en PascalCase : `app-header.vue` donne `AppHeader`.

> [!TIP]
> Donne au fichier le nom complet du composant : `base/foo/BaseFooButton.vue`. Tu retrouves ainsi le fichier en cherchant le nom.

Pour ne garder que le nom du fichier (comme en Nuxt 2), désactive le préfixe :

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  components: [{ path: '~/components', pathPrefix: false }],
})
```

> [!NOTE]
> **Changement en Nuxt 4.** Vue donne maintenant aux composants le même nom que Nuxt (`BaseFooButton`). Si tes tests cherchent un composant par son nom (`findComponent`), ou si tu listes des noms dans `<KeepAlive>`, vérifie-les.

## Le préfixe Lazy

Ajoute `Lazy` devant le nom pour charger le code du composant **plus tard**, dans un fichier séparé.

```vue
<script setup lang="ts">
const ouvert = ref(false)
</script>

<template>
  <button @click="ouvert = true">Voir les avis</button>
  <LazyListeAvis v-if="ouvert" />
</template>
```

Le code de `ListeAvis` n'est téléchargé qu'au premier affichage. Sans `v-if`, il est chargé tout de suite : `Lazy` n'apporte alors presque rien.

Tu peux aussi retarder l'**hydratation** d'un composant Lazy, c'est-à-dire le moment où il devient interactif :

```vue
<template>
  <LazyPiedDePage hydrate-on-visible />
  <LazyCarte hydrate-on-idle />
</template>
```

`hydrate-on-visible` attend que le composant soit visible à l'écran. `hydrate-on-idle` attend que le navigateur soit libre.

## Rendre seulement dans le navigateur

Certains composants ne peuvent pas tourner sur le serveur : ils utilisent `window`, `localStorage` ou une bibliothèque qui touche au DOM. Deux solutions.

`<ClientOnly>` entoure le composant. Le slot `#fallback` s'affiche côté serveur en attendant.

```vue
<template>
  <ClientOnly>
    <GraphiqueVentes />
    <template #fallback>
      <p>Chargement du graphique…</p>
    </template>
  </ClientOnly>
</template>
```

Le suffixe `.client.vue` fait la même chose pour tout le composant : `Commentaires.client.vue` ne s'affiche que dans le navigateur.

À l'inverse, le suffixe `.server.vue` crée un **composant serveur** : il est rendu sur le serveur, et son JavaScript n'est pas envoyé au navigateur. Il doit avoir un seul élément racine. Réserve-le aux contenus lourds et non interactifs (rendu de Markdown, coloration de code).

## Les composables

Un **composable** est une fonction qui utilise la Composition API (`ref`, `useState`, `useFetch`…) et qu'on réutilise dans plusieurs composants. Par convention, son nom commence par `use`.

```ts
// app/composables/useCompteur.ts
export function useCompteur(depart = 0) {
  const valeur = useState('compteur', () => depart)
  const incrementer = () => valeur.value++
  return { valeur, incrementer }
}
```

```vue
<script setup lang="ts">
const { valeur, incrementer } = useCompteur()
</script>
```

Nuxt ne lit que le **premier niveau** de `app/composables/` : `useCompteur.ts` et `index.ts` sont lus, `app/composables/panier/usePanier.ts` ne l'est pas. Réexporte les fichiers imbriqués depuis `index.ts` si besoin.

> [!WARNING]
> Les composables de Nuxt doivent être appelés au bon moment : dans `<script setup>`, un plugin, un middleware ou un autre composable. Si tu appelles `useRuntimeConfig()` tout en haut d'un fichier, ou dans une fonction lancée plus tard (après un `await` dans une fonction normale), tu obtiens l'erreur `Nuxt instance is unavailable`.

## Les utils

`app/utils/` contient des fonctions simples, sans réactivité. Elles sont auto-importées dans l'app, y compris dans les templates.

```ts
// app/utils/formatPrix.ts
export function formatPrix(centimes: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(centimes / 100)
}
```

Où ranger une fonction ?

- utilisée seulement dans l'app → `app/utils/` ;
- utilisée seulement sur le serveur → `server/utils/` ;
- utilisée des deux côtés (validation, calculs, types) → `shared/utils/` ou `shared/types/`.

```ts
// shared/utils/estEmailValide.ts : utilisable dans app/ ET dans server/
export const estEmailValide = (email: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
```

Le code de `shared/` ne doit importer ni Vue ni Nitro. Un fichier hors de `shared/utils/` et `shared/types/` s'importe avec l'alias `#shared` : `import { lower } from '#shared/formatters/lower'`.

## Les alias utiles

| Alias | Pointe vers |
|-------|-------------|
| `~` ou `@` | `app/` |
| `~~` ou `@@` | la racine du projet |
| `#shared` | `shared/` |
| `#server` | `server/` (seulement depuis le code serveur) |
| `#imports` | tous les auto-imports |
| `#components` | tous les composants |

## Pièges fréquents

- **Composable dans un sous-dossier.** `app/composables/panier/usePanier.ts` n'est pas auto-importé. Mets-le au premier niveau ou réexporte-le.
- **Composable de Nuxt appelé hors contexte.** `useState`, `useRoute`, `useRuntimeConfig`… s'appellent dans `setup`, pas en haut d'un module ni dans un `setTimeout`.
- **`Lazy` sans condition.** `<LazyX />` sans `v-if` charge le composant immédiatement.
- **API du navigateur dans `setup`.** `localStorage.getItem()` plante côté serveur. Passe par `onMounted()`, `<ClientOnly>` ou `useCookie()`.
- **Importer `server/utils` dans l'app.** Ces helpers n'existent que sur le serveur. Le code commun va dans `shared/`.
- **Deux composants avec le même nom.** Nuxt n'en garde qu'un et affiche un avertissement. Renomme l'un des fichiers.

## Résumé

- Vue, Nuxt, tes composants, composables et utils sont auto-importés. Tu peux importer explicitement avec `#imports` et `#components`.
- Le nom d'un composant = dossiers + fichier, sans répétition. Les dossiers `(groupe)` sont ignorés.
- `Lazy` charge le code plus tard. `hydrate-on-visible` retarde l'hydratation.
- `<ClientOnly>` et `.client.vue` : navigateur seulement. `.server.vue` : composant rendu sur le serveur.
- `app/utils/` pour l'app, `server/utils/` pour le serveur, `shared/` pour les deux.

## Pour pratiquer

Fais [l'exercice « Deviner le nom d'un composant »](#/nuxt/exercice/03-nom-composant). Dans [le TP « Pages et layout »](#/nuxt/tp/01-pages-layout), range ton menu dans un composant de `app/components/`.
