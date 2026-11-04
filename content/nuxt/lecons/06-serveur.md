# Le serveur Nitro

## Objectifs

- Créer des routes d'API dans `server/api/` et `server/routes/`.
- Limiter une route à une méthode avec `.get.ts`, `.post.ts`…
- Lire la requête : query, paramètres, corps.
- Valider les données avec zod et renvoyer des erreurs HTTP.
- Partager du code avec `server/utils/` et stocker des données avec `useStorage`.

## Nitro, c'est quoi ?

**Nitro** est le moteur serveur de Nuxt. Il reçoit les requêtes HTTP, rend les pages et exécute tes routes d'API. Il s'appuie sur **h3**, une petite bibliothèque qui fournit les helpers (`readBody`, `getQuery`…).

Tout le code serveur va dans `server/`. Il n'est jamais envoyé au navigateur : tu peux y lire une base de données ou utiliser des clés secrètes.

```text
server/
├─ api/
│  ├─ bonjour.ts              → /api/bonjour (toutes méthodes)
│  └─ taches/
│     ├─ index.get.ts         → GET    /api/taches
│     ├─ index.post.ts        → POST   /api/taches
│     ├─ [id].get.ts          → GET    /api/taches/:id
│     └─ [id].delete.ts       → DELETE /api/taches/:id
├─ routes/
│  └─ sante.ts                → /sante (sans préfixe /api)
├─ middleware/                ← exécuté avant chaque requête
└─ utils/                     ← helpers auto-importés côté serveur
```

## Une première route

Chaque fichier exporte par défaut un **handler** créé avec `defineEventHandler`. Ce que tu renvoies est envoyé en JSON.

```ts
// server/api/bonjour.ts
export default defineEventHandler((event) => {
  return { message: 'Bonjour depuis Nitro', date: new Date().toISOString() }
})
```

Le paramètre `event` représente la requête et la réponse. Les helpers de h3 le prennent en premier argument.

Dans une page, appelle la route avec `useFetch` :

```vue
<script setup lang="ts">
const { data } = await useFetch('/api/bonjour')
</script>

<template>
  <p>{{ data?.message }}</p>
</template>
```

Les fichiers de `server/routes/` marchent pareil, sans le préfixe `/api`. C'est utile pour un `/sitemap.xml` ou un `/sante` de supervision.

## Une méthode par fichier

Un suffixe `.get`, `.post`, `.put`, `.patch` ou `.delete` limite la route à une méthode HTTP. Les autres méthodes reçoivent une erreur **405**. Pour la racine d'un dossier, nomme le fichier `index.get.ts`, `index.post.ts`…

## Lire la requête

```ts
// server/api/produits/index.get.ts → GET /api/produits?categorie=velo&page=2
export default defineEventHandler((event) => {
  const query = getQuery(event)          // { categorie: 'velo', page: '2' }
  const page = Number(query.page ?? 1)
  return { categorie: query.categorie, page }
})
```

```ts
// server/api/taches/[id].get.ts → GET /api/taches/42
export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))   // '42' → 42
  return { id }
})
```

```ts
// server/api/taches/index.post.ts → POST /api/taches
export default defineEventHandler(async (event) => {
  const corps = await readBody(event)    // le JSON envoyé, déjà converti
  return { recu: corps }
})
```

Les valeurs de la query et des paramètres sont des **chaînes**. Convertis-les.

Autres helpers utiles : `getCookie(event, 'nom')`, `getRequestHeader(event, 'authorization')`, `setResponseStatus(event, 201)`.

## Valider avec zod

Ne fais jamais confiance au corps reçu. **zod** est une bibliothèque qui décrit la forme attendue des données et la vérifie.

```bash
npm i zod
```

```ts
// server/api/taches/index.post.ts
import { z } from 'zod'

const schemaTache = z.object({
  titre: z.string().trim().min(1, 'Le titre est obligatoire'),
  faite: z.boolean().default(false),
})

export default defineEventHandler(async (event) => {
  const tache = await readValidatedBody(event, schemaTache.parse)
  // ici, tache est valide et typée : { titre: string, faite: boolean }
  setResponseStatus(event, 201)
  return await ajouterTache(tache)
})
```

`readValidatedBody` lit le corps, puis appelle ta fonction de validation. Si elle lève une erreur, la requête reçoit une réponse **400**. `getValidatedQuery(event, schema.parse)` fait la même chose pour la query.

## Renvoyer une erreur

Une erreur non prévue donne une réponse **500**. Pour un autre code, lève une erreur avec `createError` :

```ts
// server/api/taches/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const tache = await trouverTache(id)
  if (!tache) {
    throw createError({ status: 404, statusText: 'Tâche introuvable' })
  }
  return tache
})
```

Côté client, `useFetch` remplit `error`, et `$fetch` lève une erreur avec `status` et `data`.

> [!NOTE]
> Les anciens noms `statusCode` et `statusMessage` marchent encore, mais la doc de Nuxt 4 utilise `status` et `statusText`. Garde `statusText` court : un texte long va dans `message` ou `data`.

## `server/utils/` : le code partagé du serveur

Les fonctions exportées par `server/utils/` sont auto-importées dans tout le dossier `server/`.

```ts
// server/utils/taches.ts
export async function trouverTache(id: number) {
  const taches = await lireTaches()
  return taches.find((t) => t.id === id)
}
```

Le code utile aussi au navigateur (types, validation simple) va dans `shared/` : voir [la leçon sur les auto-imports](#/nuxt/lecon/03-composants-auto-imports).

```ts
// shared/types/tache.ts : type auto-importé dans app/ et dans server/
export interface Tache {
  id: number
  titre: string
  faite: boolean
}
```

## Stocker des données : `useStorage`

Nitro inclut une couche de stockage clé-valeur. `useStorage('data')` écrit dans le dossier `.data/kv` en local (avec le serveur Node), et les données survivent au redémarrage.

```ts
// server/utils/taches.ts
export async function lireTaches() {
  return (await useStorage('data').getItem<Tache[]>('taches')) ?? []
}

export async function ajouterTache(nouvelle: { titre: string; faite: boolean }) {
  const taches = await lireTaches()
  const tache = { id: Date.now(), ...nouvelle }
  await useStorage('data').setItem('taches', [...taches, tache])
  return tache
}
```

Méthodes utiles : `getItem`, `setItem`, `hasItem`, `removeItem`, `getKeys`. En production, tu peux brancher un autre pilote (Redis, base clé-valeur de l'hébergeur) dans `nitro.storage` de `nuxt.config.ts`, sans changer ce code.

## Ce qui change avec Nuxt 4.6 et Nuxt 5

En Nuxt 4, les helpers ci-dessus viennent de **h3 v1** et sont auto-importés dans `server/`. Depuis Nuxt 4.6, un module `nuxt/server` propose les mêmes noms, indépendants de la version de Nitro.

```ts
// server/api/taches/index.post.ts, version portable
import { defineEventHandler, readValidatedBody } from 'nuxt/server'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  // Ici, readValidatedBody accepte directement le schéma.
  const tache = await readValidatedBody(event, z.object({ titre: z.string().min(1) }))
  return tache
})
```

> [!NOTE]
> Nuxt 5 passera à Nitro v3 et h3 v2, et les auto-imports serveur deviendront facultatifs. Le code écrit avec `nuxt/server` restera valable. Dans un fichier, n'utilise **pas** en même temps `defineEventHandler` auto-importé (h3) et des helpers de `nuxt/server` : ils n'attendent pas le même `event`.

## Pièges fréquents

- **`readBody` dans une route GET.** h3 répond par une erreur 405. Lis le corps dans un fichier `.post.ts`, `.put.ts`…
- **Oublier `await` devant `readBody`.** Tu obtiens une promesse au lieu des données.
- **Paramètre pris pour un nombre.** `getRouterParam` renvoie une chaîne : `Number(…)` avant de comparer avec `===`.
- **Stocker les données dans un tableau du module.** Il est perdu au redémarrage et n'est pas partagé entre plusieurs instances du serveur. Utilise `useStorage` ou une base de données.
- **Importer du code de `app/` dans `server/`.** Les composables Vue n'existent pas côté serveur. Le code commun va dans `shared/`.
- **Mettre un message long dans `statusText`.** Utilise `message` ou `data` pour les détails.

## Résumé

- `server/api/x.ts` → `/api/x`, `server/routes/x.ts` → `/x`. Chaque fichier exporte `defineEventHandler(…)`.
- Les suffixes `.get.ts`, `.post.ts`… limitent la méthode.
- `getQuery`, `getRouterParam`, `readBody` lisent la requête. Les valeurs de l'URL sont des chaînes.
- `readValidatedBody(event, schema.parse)` valide avec zod et répond 400 si besoin.
- `throw createError({ status, statusText })` renvoie une erreur HTTP.
- `server/utils/` est auto-importé côté serveur. `useStorage('data')` stocke des données clé-valeur.

## Pour pratiquer

Fais [l'exercice « Des handlers Nitro pour une API de tâches »](#/nuxt/exercice/06-api-taches). Ensuite, écris une vraie API dans [le TP « API serveur de tâches »](#/nuxt/tp/03-api-taches).
