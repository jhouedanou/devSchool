# Pages et routage

## Objectifs

- Créer des routes avec des fichiers dans `app/pages/`.
- Lire les paramètres d'une route dynamique (`[id].vue`, `[...slug].vue`).
- Naviguer avec `<NuxtLink>` et `navigateTo()`.
- Partager une mise en page avec les layouts.
- Afficher une page d'erreur avec `app/error.vue`.

## Une page = un fichier

Chaque fichier `.vue` de `app/pages/` devient une route. Nuxt génère la configuration de Vue Router pour toi.

```text
app/pages/
├─ index.vue              → /
├─ a-propos.vue           → /a-propos
├─ produits/
│  ├─ index.vue           → /produits
│  └─ [id].vue            → /produits/:id
├─ blog/
│  └─ [...slug].vue       → /blog/n/importe/quoi
└─ (marketing)/
   └─ contact.vue         → /contact
```

- `index.vue` correspond à la racine du dossier.
- Un dossier entre parenthèses, comme `(marketing)/`, sert à ranger les fichiers. Il n'apparaît pas dans l'URL.

Pour afficher la page courante, `app/app.vue` doit contenir `<NuxtPage />` :

```vue
<!-- app/app.vue -->
<template>
  <div>
    <header>Ma boutique</header>
    <NuxtPage />
  </div>
</template>
```

> [!IMPORTANT]
> Une page doit avoir **un seul élément racine** dans son `<template>`. Sinon, les transitions entre pages échouent et la page peut ne pas s'afficher lors d'une navigation.

## Les routes dynamiques

Des crochets dans le nom créent un **paramètre**. `app/pages/produits/[id].vue` répond à `/produits/1`, `/produits/42`, etc.

```vue
<!-- app/pages/produits/[id].vue -->
<script setup lang="ts">
const route = useRoute()
const id = computed(() => Number(route.params.id))
</script>

<template>
  <h1>Produit n° {{ id }}</h1>
</template>
```

`useRoute()` renvoie la route courante : `path`, `params`, `query`, `hash`… Les paramètres sont toujours des **chaînes** : convertis-les si tu as besoin d'un nombre.

| Fichier | URL | `route.params` |
|---------|-----|----------------|
| `produits/[id].vue` | `/produits/7` | `{ id: '7' }` |
| `[categorie]/[id].vue` | `/velos/7` | `{ categorie: 'velos', id: '7' }` |
| `blog/[...slug].vue` | `/blog/2026/nuxt` | `{ slug: ['2026', 'nuxt'] }` |
| `[[lang]]/index.vue` | `/` ou `/fr` | `lang` vide, ou `{ lang: 'fr' }` |

- `[...slug].vue` est une route **attrape-tout** (catch-all) : elle prend tous les segments restants, sous forme de tableau.
- Des doubles crochets `[[lang]]` rendent le paramètre facultatif.

Pour la requête (`?page=2`), lis `route.query.page`.

### Le nom des routes

Nuxt donne un nom à chaque route d'après le chemin du fichier : `produits/[id].vue` s'appelle `produits-id`. Tu peux l'utiliser pour naviguer.

## Naviguer entre les pages

### `<NuxtLink>`

`<NuxtLink>` remplace `<a>` et `<RouterLink>`. Il change de page **sans recharger** et précharge le code de la page cible quand le lien devient visible.

```vue
<template>
  <nav>
    <NuxtLink to="/">Accueil</NuxtLink>
    <NuxtLink :to="`/produits/${produit.id}`">{{ produit.nom }}</NuxtLink>
    <NuxtLink :to="{ name: 'produits-id', params: { id: 3 } }">Produit 3</NuxtLink>
    <NuxtLink to="https://nuxt.com" target="_blank">Doc</NuxtLink>
  </nav>
</template>
```

Pour un lien externe (ou avec `target`), `<NuxtLink>` produit un `<a>` classique avec `rel="noopener noreferrer"`.

### `navigateTo()`

Dans le script, utilise `navigateTo()`. La fonction est auto-importée.

```ts
async function enregistrer() {
  await $fetch('/api/profil', { method: 'POST', body: profil.value })
  await navigateTo('/compte')
}

// Avec une requête
await navigateTo({ path: '/recherche', query: { q: 'vélo' } })

// Vers un autre site : external est obligatoire
await navigateTo('https://nuxt.com', { external: true })
```

`useRouter()` donne aussi accès au routeur : `useRouter().back()` revient à la page précédente.

## Les routes imbriquées

Un fichier et un dossier du même nom créent une route parente et ses routes enfants. La page parente affiche l'enfant avec `<NuxtPage />`.

```text
app/pages/
├─ compte.vue             → /compte (parent)
└─ compte/
   ├─ index.vue           → /compte
   └─ commandes.vue       → /compte/commandes
```

```vue
<!-- app/pages/compte.vue -->
<template>
  <div>
    <h1>Mon compte</h1>
    <NuxtLink to="/compte/commandes">Mes commandes</NuxtLink>
    <NuxtPage />
  </div>
</template>
```

## Les layouts

Un **layout** est une mise en page partagée par plusieurs pages (en-tête, menu, pied de page).

```text
app/
├─ app.vue
└─ layouts/
   ├─ default.vue         → utilisé par défaut
   └─ admin.vue           → utilisé si la page le demande
```

```vue
<!-- app/layouts/default.vue -->
<template>
  <div class="page">
    <header>
      <NuxtLink to="/">Accueil</NuxtLink>
      <NuxtLink to="/a-propos">À propos</NuxtLink>
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>
```

La page s'affiche à la place du `<slot />`. Active les layouts dans `app.vue` avec `<NuxtLayout>` :

```vue
<!-- app/app.vue -->
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

Pour choisir un autre layout, la page appelle `definePageMeta()` :

```vue
<!-- app/pages/admin/index.vue -->
<script setup lang="ts">
definePageMeta({
  layout: 'admin',   // ou false pour aucun layout
})
</script>
```

> [!NOTE]
> Un layout a **un seul élément racine**, et cet élément ne peut pas être `<slot />`. Si toute l'app n'a qu'une mise en page, mets-la directement dans `app.vue`.

## `definePageMeta()`

`definePageMeta()` décrit la page : `layout`, `middleware`, `name`, `alias`, `validate`…

```ts
definePageMeta({
  layout: 'admin',
  middleware: ['auth'],
  validate: (route) => /^\d+$/.test(String(route.params.id)),
})
```

Si `validate` renvoie `false`, Nuxt cherche une autre route, puis affiche une erreur 404.

C'est une **macro** du compilateur, comme `defineProps`. Son contenu est sorti du composant au build : n'y mets pas de `ref` ni de variable du composant.

## La page d'erreur

`app/error.vue` remplace la page d'erreur par défaut. Ce n'est **pas** une route : ne la mets pas dans `app/pages/`.

```vue
<!-- app/error.vue -->
<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

function accueil() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div>
    <h1>Erreur {{ error.status }}</h1>
    <p>{{ error.statusText }}</p>
    <button @click="accueil">Retour à l'accueil</button>
  </div>
</template>
```

Dans une page, lève une erreur avec `createError()` :

```ts
const { data: produit } = await useFetch(`/api/produits/${route.params.id}`)
if (!produit.value) {
  throw createError({ status: 404, statusText: 'Produit introuvable' })
}
```

> [!NOTE]
> **Changement récent (Nuxt 4.x).** La doc utilise maintenant `status` et `statusText`. Les anciens noms `statusCode` et `statusMessage` marchent encore mais sont dépréciés.

## Pièges fréquents

- **Paramètre pris pour un nombre.** `route.params.id` vaut `'3'`. `route.params.id + 1` donne `'31'`. Utilise `Number()`.
- **Oublier `<NuxtPage />`.** Sans lui dans `app.vue` (ou dans la page parente), rien ne s'affiche.
- **Utiliser `<a href>` pour un lien interne.** La page se recharge entièrement et l'état est perdu. Utilise `<NuxtLink>`.
- **Mettre `error.vue` dans `pages/`.** Il va dans `app/error.vue`.
- **Plusieurs éléments racine** dans une page ou un layout : la navigation peut casser.
- **Une ref dans `definePageMeta`.** La macro est sortie du composant : elle ne voit pas tes variables.

## Résumé

- `app/pages/` : un fichier = une route, `index.vue` = racine du dossier.
- `[id].vue` crée un paramètre, `[...slug].vue` attrape tout, `[[x]]` est facultatif. Lis-les avec `useRoute().params`.
- `<NuxtLink>` dans le template, `navigateTo()` dans le script.
- Layouts : `app/layouts/default.vue` + `<NuxtLayout>` dans `app.vue`, et `definePageMeta({ layout })` pour en changer.
- `app/error.vue` affiche les erreurs, `createError()` en lève une, `clearError()` les efface.

## Pour pratiquer

Fais [l'exercice « Une page produit dynamique »](#/nuxt/exercice/02-page-produit). Ensuite, enchaîne avec [le TP « Pages et layout »](#/nuxt/tp/01-pages-layout) et [le TP « Route dynamique »](#/nuxt/tp/02-route-dynamique).
