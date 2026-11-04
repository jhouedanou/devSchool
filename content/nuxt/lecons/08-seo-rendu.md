# SEO et modes de rendu

## Objectifs

- Définir les balises du `<head>` avec `app.head`, `useHead` et `useSeoMeta`.
- Donner un titre et une description à chaque page, même dynamique.
- Choisir un mode de rendu par route avec `routeRules`.
- Générer un site statique avec `nuxt generate`.
- Reconnaître et corriger une erreur d'hydratation.

## Pourquoi le SEO est simple avec Nuxt

Le **SEO** (référencement) dépend de ce que les robots lisent dans le HTML : titre, description, contenu. Avec le SSR, le HTML envoyé contient déjà tout. Il reste à bien remplir le `<head>`.

Nuxt gère le `<head>` avec la bibliothèque **Unhead**. Tu as trois outils.

## `app.head` : les valeurs par défaut

Dans `nuxt.config.ts`, `app.head` fixe les balises communes à toutes les pages. Ces valeurs ne sont pas réactives.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Ma boutique',
      htmlAttrs: { lang: 'fr' },
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
      meta: [{ name: 'description', content: 'Des vélos pour la ville.' }],
    },
  },
})
```

Nuxt ajoute déjà `charset` (`utf-8`) et `viewport`.

## `useHead` : tout le `<head>`, en réactif

`useHead()` s'appelle dans un composant. Il accepte des valeurs réactives.

```vue
<!-- app/app.vue -->
<script setup lang="ts">
useHead({
  titleTemplate: (titre) => (titre ? `${titre} · Ma boutique` : 'Ma boutique'),
  htmlAttrs: { lang: 'fr' },
  link: [{ rel: 'preconnect', href: 'https://images.exemple.fr' }],
})
</script>
```

`titleTemplate` met en forme le titre de toutes les pages. Une page qui appelle `useHead({ title: 'Vélos' })` affiche « Vélos · Ma boutique ». La forme fonction doit être dans `app.vue`, pas dans `nuxt.config.ts`.

## `useSeoMeta` : les balises SEO, sans faute de frappe

`useSeoMeta()` prend un objet à plat, avec un nom de propriété par balise. TypeScript connaît toutes les clés : tu évites les erreurs du type `name` au lieu de `property`.

```vue
<!-- app/pages/produits/[id].vue -->
<script setup lang="ts">
const route = useRoute()
const { data: produit } = await useFetch(`/api/produits/${route.params.id}`)

useSeoMeta({
  title: () => produit.value?.nom ?? 'Produit introuvable',
  description: () => produit.value?.description,
  ogTitle: () => produit.value?.nom,
  ogImage: () => produit.value?.image,
  twitterCard: 'summary_large_image',
})
</script>
```

Les valeurs peuvent être des fonctions (getters), des `ref` ou des `computed` : le `<head>` suit les données.

`ogTitle`, `ogImage`… remplissent les balises **Open Graph**, lues par les réseaux sociaux pour afficher un aperçu du lien.

> [!NOTE]
> **Changement en Nuxt 4.** Unhead v2 a supprimé les propriétés `hid` et `vmid`. Elles ne servent plus : les balises `meta` sont dédupliquées d'après leur nom. Retire-les de ton ancien code.

Tu peux aussi écrire le `<head>` dans le template avec les composants `<Title>`, `<Meta>`, `<Link>`… Les composables restent la façon recommandée.

## Choisir le mode de rendu par route

Rappel des modes vus dans [la première leçon](#/nuxt/lecon/01-decouvrir-nuxt) :

- **SSR** : HTML produit à chaque requête (par défaut) ;
- **SSG / prérendu** : HTML produit au build ;
- **SPA** : HTML produit dans le navigateur.

`routeRules`, dans `nuxt.config.ts`, applique une règle à un chemin ou à un groupe de chemins (`**` = tout ce qui suit).

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },              // HTML créé au build
    '/a-propos': { prerender: true },
    '/blog/**': { swr: 3600 },             // cache serveur d'une heure
    '/produits/**': { isr: true },         // cache sur le CDN jusqu'au prochain déploiement
    '/admin/**': { ssr: false },           // rendu dans le navigateur seulement
    '/api/**': { cors: true },
    '/ancienne-page': { redirect: '/nouvelle-page' },
  },
})
```

| Règle | Effet |
|-------|-------|
| `prerender: true` | la page est rendue au build et servie comme fichier statique |
| `swr: 3600` | le serveur garde la réponse en cache ; après 3600 s, il sert l'ancienne version et la régénère en arrière-plan |
| `isr: true` ou `isr: 60` | comme `swr`, mais le cache vit sur le CDN de l'hébergeur (Netlify, Vercel) |
| `ssr: false` | pas de rendu serveur pour ces pages (SPA) |
| `redirect` | redirection côté serveur |
| `headers`, `cors` | ajoute des en-têtes HTTP |

Mélanger ces règles s'appelle le **rendu hybride**. Il demande un serveur : il marche avec `nuxt build`.

## Un site statique : `nuxt generate`

`nuxt generate` construit l'app puis **prérend** les pages. Un robot part de `/`, suit chaque lien `<a href>` trouvé et enregistre le HTML et les données de chaque page dans `.output/public/`.

```bash
npx nuxt generate
npx serve .output/public    # pour tester le résultat
```

Une page qu'aucun lien n'atteint n'est pas générée. Ajoute-la à la main :

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  prerender: {
    routes: ['/produits/1', '/produits/2', '/sitemap.xml'],
  },
})
```

Nuxt crée aussi `200.html` et `404.html` : des pages de secours que l'hébergeur sert pour les URL inconnues.

> [!IMPORTANT]
> Un site généré n'a pas de serveur : les routes de `server/api/` ne répondent plus en production. Seules les données chargées **pendant** le prérendu sont enregistrées, dans le payload de chaque page.

## Les erreurs d'hydratation

Rappel : l'**hydratation** branche Vue sur le HTML envoyé par le serveur. Si le premier rendu du navigateur est **différent** du HTML reçu, Vue affiche un avertissement `Hydration mismatch` et corrige la page. Résultat : un clignotement, du travail perdu, parfois des boutons qui ne répondent plus.

Causes fréquentes et solutions :

| Cause | Exemple | Solution |
|-------|---------|----------|
| API du navigateur | `localStorage.getItem('theme')` | `useCookie('theme')` |
| Valeur aléatoire | `Math.random()` dans le template | `useState('id', () => Math.random())` |
| Date ou heure | `new Date().toLocaleTimeString()` | `<NuxtTime>` ou affichage dans `onMounted` |
| Condition sur `window` | `v-if="window.innerWidth > 768"` | media queries CSS |
| HTML invalide | un `<div>` dans un `<p>` | corrige l'imbrication |
| Contenu propre au navigateur | widget, carte, graphique | `<ClientOnly>` |

```vue
<script setup lang="ts">
// ✗ Le serveur et le navigateur tirent deux nombres différents.
const numero = Math.floor(Math.random() * 100)

// ✓ Le nombre tiré sur le serveur est transmis au navigateur.
const numeroStable = useState('numero', () => Math.floor(Math.random() * 100))
</script>
```

## Pièges fréquents

- **Une valeur lue une seule fois.** `useSeoMeta({ title: produit.value?.nom })` lit la valeur à l'appel. Si les données changent ensuite, passe une fonction ou un `computed`.
- **Une fonction `titleTemplate` dans `nuxt.config.ts`.** Seule la forme chaîne (`'%s · Ma boutique'`) y est acceptée. Mets la fonction dans `app.vue`.
- **Une page oubliée par `nuxt generate`.** Sans lien vers elle, ajoute-la dans `prerender.routes`.
- **`routeRules` hybrides avec `nuxt generate`.** Le rendu hybride a besoin d'un serveur : utilise `nuxt build`.
- **Ignorer les avertissements d'hydratation.** Ils signalent un vrai problème : corrige-les.
- **Mettre des données sensibles dans une page prérendue.** Le HTML est public et identique pour tout le monde.

## Résumé

- `app.head` pour les valeurs fixes, `useHead` pour tout le `<head>` en réactif, `useSeoMeta` pour les balises SEO typées.
- Passe des fonctions, des `ref` ou des `computed` pour un `<head>` qui suit les données.
- `routeRules` choisit le rendu par route : `prerender`, `swr`, `isr`, `ssr: false`, `redirect`…
- `nuxt generate` prérend les pages en suivant les liens, dans `.output/public/`.
- Une erreur d'hydratation vient d'un rendu différent entre serveur et navigateur : `useState`, `useCookie`, `<ClientOnly>` ou `onMounted` la corrigent.

## Pour pratiquer

Fais [l'exercice « Les balises SEO d'une fiche produit »](#/nuxt/exercice/08-seo-produit). Ensuite, reprends [le TP « Route dynamique /produits/[id] »](#/nuxt/tp/02-route-dynamique) et ajoute `useSeoMeta` à la fiche produit.
