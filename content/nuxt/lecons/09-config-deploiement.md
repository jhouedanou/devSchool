# Configuration et déploiement

## Objectifs

- Distinguer `nuxt.config.ts`, `runtimeConfig` et `app.config.ts`.
- Garder les secrets côté serveur et les surcharger avec des variables `NUXT_*`.
- Ajouter des modules (`@nuxt/image`, `@nuxt/content`, `@nuxt/ui`…).
- Construire l'app et la lancer en production.
- Déployer sur un serveur Node, un hébergement statique ou avec un preset Nitro.

## Trois fichiers, trois rôles

| Fichier | Contient | Modifiable après le build ? | Visible dans le navigateur ? |
|---------|----------|-----------------------------|------------------------------|
| `nuxt.config.ts` | la configuration du framework (modules, CSS, routeRules…) | non | non |
| `runtimeConfig` (dans `nuxt.config.ts`) | URL d'API, clés, secrets | oui, avec des variables `NUXT_*` | seulement la partie `public` |
| `app/app.config.ts` | réglages publics de l'app (thème, nom, options d'interface) | non | oui, tout |

## `runtimeConfig` : la config qui change selon l'environnement

Déclare chaque clé dans `nuxt.config.ts`, avec une valeur par défaut.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Privé : seulement côté serveur.
    stripeSecret: '',
    // Public : serveur ET navigateur.
    public: {
      apiBase: '/api',
    },
  },
})
```

Lis-la avec `useRuntimeConfig()` :

```vue
<!-- Dans l'app : seule la partie public est disponible. -->
<script setup lang="ts">
const config = useRuntimeConfig()
console.log(config.public.apiBase)
</script>
```

```ts
// server/api/paiement.post.ts : côté serveur, toute la config est disponible.
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  return await creerPaiement(config.stripeSecret)
})
```

Passe `event` à `useRuntimeConfig` dans le code serveur : tu obtiens les valeurs à jour de l'environnement.

### Les variables `NUXT_*`

Au démarrage, Nuxt remplace chaque valeur par la variable d'environnement correspondante. Le nom : `NUXT_`, puis le chemin de la clé en majuscules, avec `_` entre les mots.

| Clé | Variable |
|-----|----------|
| `stripeSecret` | `NUXT_STRIPE_SECRET` |
| `public.apiBase` | `NUXT_PUBLIC_API_BASE` |

```bash
# .env : lu en dev, au build et par nuxt preview. PAS en production.
NUXT_STRIPE_SECRET=sk_test_123
NUXT_PUBLIC_API_BASE=https://api.exemple.fr
```

> [!IMPORTANT]
> En production, le fichier `.env` n'est **pas** lu. Définis les variables dans l'environnement du serveur ou dans le tableau de bord de l'hébergeur. Seules les variables qui commencent par `NUXT_` et qui correspondent à une clé déclarée sont prises en compte.

> [!WARNING]
> N'écris pas `stripeSecret: process.env.STRIPE_KEY`. Cette valeur est figée au build. Utilise le nom `NUXT_STRIPE_SECRET`, que Nuxt lit au démarrage.

Les clés `app` et `appSecret` sont réservées à Nuxt. Ne les utilise pas pour tes propres valeurs.

## `app.config.ts` : des réglages publics et réactifs

`app/app.config.ts` contient des réglages fixés au build, envoyés au navigateur. Ils sont réactifs : un module ou ton code peut les modifier pendant l'exécution.

```ts
// app/app.config.ts
export default defineAppConfig({
  nomDuSite: 'Ma boutique',
  theme: { couleurPrincipale: '#00dc82' },
})
```

```vue
<script setup lang="ts">
const appConfig = useAppConfig()
</script>

<template>
  <h1 :style="{ color: appConfig.theme.couleurPrincipale }">{{ appConfig.nomDuSite }}</h1>
</template>
```

Aucun secret dans `app.config.ts` : tout son contenu est public. Les variables d'environnement ne le modifient pas.

## Les modules

Un **module** étend Nuxt : il ajoute des composants, des composables, des routes ou de la configuration. Installe-le avec une seule commande :

```bash
npx nuxt module add image
```

Elle installe le paquet et l'ajoute à `modules`. Chaque module se règle avec sa propre clé :

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/image', '@nuxt/content', '@pinia/nuxt'],
  image: { quality: 80 },
})
```

| Module | Pour quoi faire |
|--------|-----------------|
| `@nuxt/image` | images optimisées avec `<NuxtImg>` et `<NuxtPicture>` |
| `@nuxt/content` | pages et articles en Markdown, dans le dossier `content/` |
| `@nuxt/ui` | une bibliothèque de composants (`<UButton>`, `<UInput>`…) basée sur Tailwind CSS |
| `@nuxt/fonts` | chargement optimisé des polices |
| `@nuxt/eslint` | configuration ESLint adaptée à Nuxt |
| `@nuxtjs/i18n` | traduction et routes par langue |
| `@pinia/nuxt` | stores Pinia (voir [la leçon sur l'état](#/nuxt/lecon/05-etat)) |
| `@nuxt/test-utils` | outils de test (voir [la leçon sur les tests](#/nuxt/lecon/10-tests)) |

```vue
<!-- Avec @nuxt/image : redimensionnement et format moderne automatiques. -->
<template>
  <NuxtImg src="/velo.jpg" width="600" format="webp" alt="Vélo de ville" />
</template>
```

```vue
<!-- Avec @nuxt/content (v3) : afficher la page Markdown qui correspond à l'URL. -->
<script setup lang="ts">
const route = useRoute()
const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('content').path(route.path).first(),
)
</script>

<template>
  <ContentRenderer v-if="page" :value="page" />
</template>
```

Pour `@nuxt/content`, la collection `content` est déclarée dans `content.config.ts`, à la racine du projet.

## Le build

```bash
npm run build          # = nuxt build
```

Le résultat est dans `.output/` :

```text
.output/
├─ public/             ← fichiers statiques (JS, CSS, images, pages prérendues)
├─ server/
│  └─ index.mjs        ← point d'entrée du serveur
└─ nitro.json
```

`.output/` contient tout ce qu'il faut pour tourner : Nitro y copie les dépendances utiles (`.output/server/node_modules/`). Tu n'as pas besoin du `node_modules` du projet. Lance-le ainsi :

```bash
NODE_ENV=production PORT=3000 NUXT_STRIPE_SECRET=sk_live_xxx node .output/server/index.mjs
```

Le serveur écoute le port 3000 par défaut (`PORT` ou `NITRO_PORT` pour le changer). Pour tester en local, `npm run preview` fait la même chose et lit ton `.env`.

## Déployer

### Sur un serveur Node

Copie `.output/` sur la machine, définis les variables `NUXT_*` et lance `node .output/server/index.mjs`. Un gestionnaire de processus comme PM2 le relance en cas de plantage. Place un proxy (nginx, Caddy) devant pour le HTTPS.

### Sur un hébergement statique

`nuxt generate` produit un site dans `.output/public/`. Envoie ce dossier sur n'importe quel hébergeur de fichiers (GitHub Pages, Netlify, un bucket S3…). Il n'y a pas de serveur : pas de routes `server/api/` et pas de `runtimeConfig` modifiable après le build.

### Avec un preset Nitro

Un **preset** adapte la sortie du build à un hébergeur (fonctions serverless, edge…). Sur Vercel, Netlify ou Cloudflare, Nitro détecte souvent le bon preset tout seul. Sinon, choisis-le :

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: { preset: 'node-server' },
})
```

```bash
NITRO_PRESET=netlify npx nuxt build
```

`node-server` est le preset par défaut.

## Pièges fréquents

- **Un secret dans `runtimeConfig.public`.** Il est envoyé au navigateur. Les secrets restent au premier niveau de `runtimeConfig`.
- **Compter sur `.env` en production.** Il n'est pas lu : configure l'environnement de l'hébergeur.
- **Une variable mal nommée.** `API_BASE` est ignorée. Écris `NUXT_PUBLIC_API_BASE`, et déclare `public.apiBase` dans `nuxt.config.ts`.
- **`process.env` dans `runtimeConfig`.** La valeur est figée au build.
- **Un secret dans `app.config.ts`.** Tout ce fichier est public.
- **Déployer `nuxt generate` en attendant une API.** Un site statique n'a pas de serveur.
- **Oublier `NODE_ENV=production`.** Certaines dépendances gardent alors leurs avertissements de développement.

## Résumé

- `nuxt.config.ts` règle le framework, `runtimeConfig` les valeurs d'environnement, `app.config.ts` les réglages publics.
- `runtimeConfig` : privé au premier niveau, partagé dans `public`. Surcharge avec `NUXT_…` et `NUXT_PUBLIC_…`.
- `.env` est lu en dev, au build et par `nuxt preview`, jamais en production.
- `npx nuxt module add <nom>` installe un module et l'ajoute à `modules`.
- `nuxt build` produit `.output/`, lancé avec `node .output/server/index.mjs`. `nuxt generate` produit un site statique. Les presets Nitro ciblent un hébergeur.

## Pour pratiquer

Cette leçon n'a pas d'exercice dans le navigateur. Dans le projet de TP, ajoute une clé `public.apiBase` à `runtimeConfig`, lance `npm run build`, puis démarre `.output/server/index.mjs` avec `NUXT_PUBLIC_API_BASE` défini. Vérifie le résultat dans [le TP « API serveur de tâches »](#/nuxt/tp/03-api-taches).
