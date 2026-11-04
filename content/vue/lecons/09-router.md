# Vue Router

## Objectifs

- Installer Vue Router et déclarer des routes.
- Naviguer avec `RouterLink` et afficher la page avec `RouterView`.
- Lire les paramètres d'URL avec `useRoute` et naviguer en code avec `useRouter`.
- Créer des routes imbriquées, des gardes de navigation et une page 404.
- Charger une page seulement quand on la visite (lazy loading).

Vue Router est le routeur officiel de Vue. Il relie l'**URL** du navigateur à un **composant**. La page ne se recharge pas : c'est une SPA (Single-Page Application : application à page unique).

> [!NOTE]
> La version actuelle est **Vue Router 5**. Pour l'API classique de ce chapitre, elle est identique à Vue Router 4. La v5 intègre aussi le routage par fichiers (les routes déduites des fichiers de `src/pages/`), comme dans Nuxt.

## Installation

Avec un nouveau projet, coche « Router » dans `npm create vue@latest`. Dans un projet existant :

```bash
npm install vue-router
```

## Déclarer les routes

```js
// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import AccueilView from '../views/AccueilView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'accueil', component: AccueilView },
    { path: '/a-propos', name: 'a-propos', component: () => import('../views/AProposView.vue') },
  ],
})

export default router
```

- `path` : le chemin dans l'URL.
- `name` : un nom pour la route. Il évite d'écrire les chemins en dur.
- `component` : le composant affiché. Les composants de page sont souvent rangés dans `src/views/`.
- `history` : `createWebHistory()` donne des URL propres (`/a-propos`).

Installe le routeur dans `main.js` :

```js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')
```

> [!WARNING]
> Avec `createWebHistory()`, le serveur de production doit renvoyer `index.html` pour toutes les URL inconnues. Sinon, recharger `/a-propos` donne une erreur 404 du serveur. Si tu ne peux pas configurer le serveur, utilise `createWebHashHistory()` (URL en `/#/a-propos`).

## RouterLink et RouterView

```vue
<!-- App.vue -->
<template>
  <nav>
    <RouterLink to="/">Accueil</RouterLink>
    <RouterLink :to="{ name: 'a-propos' }">À propos</RouterLink>
  </nav>

  <main>
    <RouterView />
  </main>
</template>
```

- `RouterLink` crée un lien `<a>`. Au clic, il change l'URL sans recharger la page.
- `RouterView` affiche le composant de la route actuelle.

Le lien actif reçoit la classe `router-link-active` (et `router-link-exact-active` s'il correspond exactement). Utilise-la pour le style :

```css
nav a.router-link-exact-active {
  font-weight: bold;
}
```

## Les paramètres dynamiques

Un segment qui commence par `:` est un **paramètre**.

```js
{ path: '/articles/:id', name: 'article', component: ArticleView }
```

Les URL `/articles/1` et `/articles/42` affichent `ArticleView`. Dans le composant, lis le paramètre avec `useRoute()` :

```vue
<!-- ArticleView.vue -->
<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const article = ref(null)

watch(
  () => route.params.id,
  async (id) => {
    const reponse = await fetch(`/api/articles/${id}`)
    article.value = await reponse.json()
  },
  { immediate: true },
)
</script>

<template>
  <article v-if="article">
    <h1>{{ article.titre }}</h1>
  </article>
</template>
```

> [!IMPORTANT]
> Quand on passe de `/articles/1` à `/articles/2`, Vue **réutilise** le même composant. `onMounted` ne se relance pas. Surveille `route.params.id` avec `watch`, comme ci-dessus.

`route.params.id` est toujours une **chaîne** : `'42'`, pas `42`. Convertis-la avec `Number()` si besoin.

Pour un lien vers une route avec paramètre, utilise son nom :

```vue
<RouterLink :to="{ name: 'article', params: { id: article.id } }">
  {{ article.titre }}
</RouterLink>
```

### Recevoir les paramètres en props

Avec `props: true`, les paramètres arrivent comme des props. Le composant ne dépend plus du routeur, il est plus simple à tester.

```js
{ path: '/articles/:id', name: 'article', component: ArticleView, props: true }
```

```js
// ArticleView.vue
const props = defineProps({ id: String })
```

### La query

La partie après `?` est dans `route.query` : pour `/recherche?q=vue&page=2`, `route.query.q` vaut `'vue'`.

## Naviguer en code : useRouter

`useRouter()` donne le routeur. Il sert à naviguer depuis une fonction, après l'envoi d'un formulaire par exemple.

```js
import { useRouter } from 'vue-router'

const router = useRouter()

async function enregistrer() {
  const article = await creerArticle()
  router.push({ name: 'article', params: { id: article.id } })
}
```

| Méthode | Effet |
|---------|-------|
| `router.push(cible)` | va vers la cible et ajoute une entrée à l'historique |
| `router.replace(cible)` | va vers la cible sans ajouter d'entrée |
| `router.back()` | revient à la page précédente |

> [!TIP]
> `useRoute()` = la route **actuelle** (params, query). `useRouter()` = le **routeur** (push, replace). Dans le template, ils existent aussi sous les noms `$route` et `$router`.

## Les routes imbriquées

Une page peut contenir ses propres sous-pages. Déclare-les dans `children`. Le composant parent place un `<RouterView />` pour les afficher.

```js
{
  path: '/compte',
  component: CompteLayout,
  children: [
    { path: '', name: 'compte', component: CompteProfil },         // /compte
    { path: 'commandes', name: 'commandes', component: CompteCommandes }, // /compte/commandes
  ],
}
```

```vue
<!-- CompteLayout.vue -->
<template>
  <aside>
    <RouterLink :to="{ name: 'compte' }">Profil</RouterLink>
    <RouterLink :to="{ name: 'commandes' }">Commandes</RouterLink>
  </aside>
  <section>
    <RouterView />
  </section>
</template>
```

Un chemin enfant sans `/` au début est relatif au parent.

## Les gardes de navigation

Une **garde** (navigation guard) est une fonction appelée avant chaque navigation. Elle peut laisser passer, annuler ou rediriger.

```js
// src/router/index.js
const routes = [
  { path: '/connexion', name: 'connexion', component: ConnexionView },
  { path: '/admin', name: 'admin', component: AdminView, meta: { authRequise: true } },
]

router.beforeEach((to, from) => {
  const connecte = Boolean(localStorage.getItem('jeton'))
  if (to.meta.authRequise && !connecte) {
    return { name: 'connexion', query: { retour: to.fullPath } }
  }
  // ne rien retourner = laisser passer
})
```

La valeur retournée décide :

- rien, `undefined` ou `true` → la navigation continue ;
- `false` → la navigation est annulée ;
- une route (`'/connexion'` ou `{ name: 'connexion' }`) → redirection.

Le champ `meta` d'une route sert à ranger des informations libres, comme `authRequise`.

> [!NOTE]
> Dans du code ancien, les gardes ont un troisième argument `next` qu'il faut appeler. Depuis Vue Router 5.0.3, `next` est déprécié : retourne une valeur à la place. `next()` devient `return`, `next(false)` devient `return false`, `next('/login')` devient `return '/login'`.

Il existe aussi des gardes plus ciblées : `beforeEnter` dans la définition d'une route, et `onBeforeRouteLeave` dans un composant (par exemple pour prévenir qu'un formulaire n'est pas enregistré).

```js
import { onBeforeRouteLeave } from 'vue-router'

onBeforeRouteLeave(() => {
  if (modifie.value) return window.confirm('Quitter sans enregistrer ?')
})
```

## Le lazy loading

Avec `component: () => import('...')`, le code de la page est mis dans un fichier séparé. Il n'est téléchargé qu'à la première visite. La page d'accueil charge donc plus vite.

```js
{ path: '/statistiques', name: 'stats', component: () => import('../views/StatsView.vue') }
```

> [!TIP]
> Garde l'import direct pour la page d'accueil, et le lazy loading pour les autres pages.

## La page 404

Ajoute une route « attrape-tout » à la fin de la liste. `(.*)*` accepte n'importe quel chemin, slashs compris.

```js
{ path: '/:pathMatch(.*)*', name: 'introuvable', component: PageIntrouvable }
```

Pour rediriger vers cette page depuis un composant (article inexistant, par exemple) : `router.replace({ name: 'introuvable', params: { pathMatch: route.path.substring(1).split('/') } })`.

> [!NOTE]
> Changements depuis Vue Router 3 (Vue 2) : `new VueRouter({ mode: 'history' })` devient `createRouter({ history: createWebHistory() })`. La route `*` devient `/:pathMatch(.*)*`. `this.$router` devient `useRouter()`.

## Pièges fréquents

- **Oublier `<RouterView />`** : l'URL change mais rien ne s'affiche.
- **Utiliser `<a href>`** au lieu de `RouterLink` : la page se recharge entièrement.
- **Croire que `onMounted` se relance** entre `/articles/1` et `/articles/2` : surveille `route.params` avec `watch`.
- **Comparer `route.params.id` à un nombre** : c'est une chaîne. `'2' === 2` est faux.
- **Rediriger sans condition** dans `beforeEach` vers une page elle-même protégée : boucle infinie. Vérifie `to.name`.
- **Placer la route 404 en premier** : elle capterait tout. Mets-la à la fin.
- **Recharger une page en production** avec `createWebHistory()` sans configurer le serveur : erreur 404.

## Résumé

- `createRouter({ history: createWebHistory(), routes })` puis `app.use(router)`.
- `RouterLink` pour les liens, `RouterView` pour afficher la page.
- `/articles/:id` déclare un paramètre ; `useRoute().params.id` le lit (une chaîne). `props: true` le passe en prop.
- `useRouter().push()` navigue depuis le code.
- `children` crée des routes imbriquées, avec un `RouterView` dans le parent.
- `router.beforeEach((to, from) => …)` : retourne `false` pour annuler, une route pour rediriger. Plus de `next`.
- `component: () => import(...)` charge la page à la demande. `/:pathMatch(.*)*` attrape les pages inconnues.

## Pour pratiquer

Le runner du navigateur n'inclut pas Vue Router : cette leçon n'a pas d'exercice en ligne. Passe directement au TP [Mini-blog avec Vue Router](#/vue/tp/07-mini-blog-router) : liste d'articles, page de détail, garde et page 404.
