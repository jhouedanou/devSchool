# Middleware et plugins

## Objectifs

- Écrire un middleware de route inline, nommé ou global.
- Rediriger avec `navigateTo()` ou bloquer avec `abortNavigation()`.
- Savoir où tourne un middleware (serveur, navigateur).
- Créer un plugin avec `defineNuxtPlugin` et fournir un helper avec `provide`.
- Filtrer chaque requête HTTP avec un middleware serveur.

## Le middleware de route

Un **middleware de route** est une fonction exécutée **avant** d'afficher une page. Il sert à vérifier une condition : utilisateur connecté, droits, paramètre valide…

Il en existe trois sortes :

| Sorte | Où | Quand |
|-------|----|-------|
| Inline (anonyme) | dans `definePageMeta()` de la page | pour cette page seulement |
| Nommé | `app/middleware/auth.ts` | pour les pages qui le demandent |
| Global | `app/middleware/suivi.global.ts` | à chaque changement de route |

```text
app/
├─ middleware/
│  ├─ 01.suivi.global.ts     ← global, exécuté en premier
│  ├─ auth.ts                ← nommé « auth »
│  └─ admin.ts               ← nommé « admin »
└─ pages/
   └─ compte.vue             ← definePageMeta({ middleware: 'auth' })
```

### Écrire un middleware

```ts
// app/middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const utilisateur = useUtilisateur()   // ton composable, basé sur useState

  if (!utilisateur.value) {
    return navigateTo({ path: '/connexion', query: { redirect: to.fullPath } })
  }
})
```

Le middleware reçoit `to` (la route d'arrivée) et `from` (la route de départ). Il n'y a pas de `next()` comme dans Vue Router : c'est la **valeur renvoyée** qui décide.

| Valeur renvoyée | Effet |
|-----------------|-------|
| rien (`undefined`) | la navigation continue |
| `navigateTo('/connexion')` | redirection |
| `abortNavigation()` | la navigation est annulée |
| `abortNavigation(createError({ status: 403 }))` | annulation avec une erreur |

La page demande le middleware avec `definePageMeta` :

```vue
<!-- app/pages/compte.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: 'auth',              // ou ['auth', 'admin']
})
</script>
```

Le nom vient du fichier, en kebab-case : `estAdmin.ts` devient `'est-admin'`.

### Un middleware global

Ajoute `.global` au nom du fichier. Il tourne à chaque navigation, sans `definePageMeta`.

```ts
// app/middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  const utilisateur = useUtilisateur()
  const protegee = to.path.startsWith('/compte')

  // On teste to.path pour éviter une boucle de redirections.
  if (protegee && !utilisateur.value) {
    return navigateTo('/connexion')
  }
})
```

Ordre d'exécution : les middlewares globaux d'abord, par ordre alphabétique (préfixe-les par `01.`, `02.` pour choisir), puis ceux de la page, dans l'ordre du tableau.

### Un middleware inline

Pour une règle propre à une seule page :

```vue
<script setup lang="ts">
definePageMeta({
  middleware: [
    function (to) {
      if (to.params.id === '0') return abortNavigation()
    },
  ],
})
</script>
```

### Où tourne le middleware ?

Au **premier chargement**, le middleware tourne sur le serveur, puis encore dans le navigateur pendant l'hydratation. Ensuite, à chaque navigation, il tourne dans le navigateur.

- Lis l'état avec `useState` ou `useCookie` : ils marchent des deux côtés.
- Pour sauter le serveur : `if (import.meta.server) return`.
- Pour une redirection permanente côté serveur : `navigateTo('/nouveau', { redirectCode: 301 })`.

> [!WARNING]
> Un middleware de route protège l'**affichage** des pages, pas les données. Un visiteur peut appeler ton API directement. Vérifie toujours les droits dans les routes de `server/api/`.

## Les plugins

Un **plugin** est un fichier de `app/plugins/` exécuté **une fois**, à la création de l'app Vue, avant les pages. Il sert à installer une bibliothèque, ajouter un helper global ou écouter des événements de Nuxt.

```ts
// app/plugins/formatPrix.ts
export default defineNuxtPlugin(() => {
  const format = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

  return {
    provide: {
      prix: (montant: number) => format.format(montant),
    },
  }
})
```

Ce qui est dans `provide` devient disponible avec un `$` devant :

```vue
<script setup lang="ts">
const { $prix } = useNuxtApp()
console.log($prix(12.5))   // « 12,50 € »
</script>

<template>
  <p>{{ $prix(12.5) }}</p>
</template>
```

> [!TIP]
> Pour une simple fonction, un fichier de `app/utils/` ou un composable suffit, sans plugin. Garde `provide` pour ce qui doit être créé une seule fois avec le contexte de Nuxt, comme un client d'API.

### Un client d'API

```ts
// app/plugins/api.ts
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const jeton = useCookie('jeton')

  const api = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ options }) {
      if (jeton.value) options.headers.set('Authorization', `Bearer ${jeton.value}`)
    },
  })

  return { provide: { api } }
})
```

Ensuite : `const { $api } = useNuxtApp()`, puis `useAsyncData('profil', () => $api('/moi'))`.

### Règles des plugins

- Seuls les fichiers au **premier niveau** de `app/plugins/` sont chargés.
- `.client.ts` : navigateur seulement (`app/plugins/analytics.client.ts`). `.server.ts` : serveur seulement.
- L'ordre suit le nom des fichiers : `01.auth.ts` avant `02.api.ts`.
- Pour un plugin Vue : `nuxtApp.vueApp.use(MaBibliotheque)`.

```ts
// app/plugins/notifications.client.ts
// « une-bibliotheque-vue » représente n'importe quel plugin Vue (app.use).
import Notifications from 'une-bibliotheque-vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Notifications, { position: 'top-right' })
})
```

La forme objet permet de nommer un plugin et de déclarer ses dépendances :

```ts
export default defineNuxtPlugin({
  name: 'api',
  dependsOn: ['auth'],
  setup() {
    // …
  },
})
```

## Le middleware serveur

Un fichier de `server/middleware/` s'exécute à **chaque requête HTTP** (pages et API), avant les routes. Il ne doit rien renvoyer : il lit la requête, ajoute des informations dans `event.context`, ou lève une erreur.

```ts
// server/middleware/utilisateur.ts
export default defineEventHandler(async (event) => {
  const jeton = getCookie(event, 'jeton')
  event.context.utilisateur = jeton ? await verifierJeton(jeton) : null
})
```

```ts
// server/api/compte.get.ts
export default defineEventHandler((event) => {
  if (!event.context.utilisateur) {
    throw createError({ status: 401, statusText: 'Connexion requise' })
  }
  return event.context.utilisateur
})
```

| | Middleware de route | Middleware serveur |
|-|---------------------|--------------------|
| Dossier | `app/middleware/` | `server/middleware/` |
| Déclenché par | un changement de page | chaque requête HTTP |
| Tourne | serveur puis navigateur | serveur seulement |
| Sert à | rediriger, bloquer une page | journaliser, lire un jeton, remplir `event.context` |

## Pièges fréquents

- **Oublier `return`.** `navigateTo('/connexion')` sans `return` ne bloque pas la page demandée.
- **Boucle de redirections.** Si `/connexion` est aussi protégée, le visiteur tourne en rond. Teste `to.path` avant de rediriger.
- **Se fier au middleware pour la sécurité.** Protège aussi les routes de l'API côté serveur.
- **Plugin rangé dans un sous-dossier.** `app/plugins/outils/date.ts` n'est pas chargé automatiquement.
- **API du navigateur dans un plugin.** `window` n'existe pas sur le serveur : utilise le suffixe `.client.ts`.
- **Un middleware serveur qui renvoie une valeur.** Il répond à la place de la route et coupe la requête. Il ne doit rien renvoyer.

## Résumé

- `defineNuxtRouteMiddleware((to, from) => …)` : ne rien renvoyer continue, `navigateTo()` redirige, `abortNavigation()` annule.
- Middleware inline (dans `definePageMeta`), nommé (`app/middleware/x.ts`) ou global (`x.global.ts`).
- Au premier chargement, il tourne sur le serveur puis dans le navigateur.
- `defineNuxtPlugin` s'exécute une fois au démarrage. `provide: { x }` donne `$x` via `useNuxtApp()`.
- `server/middleware/` s'exécute à chaque requête HTTP et remplit `event.context`.

## Pour pratiquer

Fais [l'exercice « Un middleware d'authentification »](#/nuxt/exercice/07-middleware-auth), puis [le TP « Middleware d'authentification »](#/nuxt/tp/06-middleware-auth).
