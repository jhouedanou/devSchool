# API serveur de tâches

## Objectif

Créer une petite API dans le dossier `server/` : lister les tâches, en lire une, en créer une nouvelle.
Les tâches sont gardées en mémoire. L'API valide les données et renvoie des erreurs claires.

## Ce que tu vas pratiquer

- les routes serveur de `server/api/` et le suffixe de méthode (`.get.ts`, `.post.ts`) ;
- `defineEventHandler`, `getQuery`, `getRouterParam`, `readBody` ;
- les erreurs HTTP avec `createError` ;
- le code de réponse avec `setResponseStatus` ;
- l'auto-import des fonctions de `server/utils/`.

Revois si besoin [la leçon sur le serveur](#/nuxt/lecon/06-serveur).

## Fichiers à créer ou modifier

- `server/utils/taches.ts`
- `server/api/taches.get.ts`
- `server/api/taches.post.ts`
- `server/api/taches/[id].get.ts`

## Étapes

1. Crée `server/utils/taches.ts`. Exporte un type `Tache` (`id`, `titre`, `fait`) et garde ces tâches dans un tableau :

   ```ts
   const taches: Tache[] = [
     { id: 1, titre: 'Lire la documentation de Nuxt', fait: true },
     { id: 2, titre: 'Créer une route API', fait: false },
     { id: 3, titre: 'Afficher les tâches', fait: false },
   ]
   ```

2. Dans ce fichier, exporte trois fonctions : `listerTaches(fait?: boolean)`, `trouverTache(id: number)` et `ajouterTache(titre: string)`. `ajouterTache` donne un nouvel id (4, puis 5…) et `fait: false`.
3. Crée `server/api/taches.get.ts`. Lis `fait` avec `getQuery(event)` :
   - `?fait=true` → seulement les tâches faites ;
   - `?fait=false` → seulement les tâches à faire ;
   - sans paramètre → toutes les tâches.
4. Crée `server/api/taches/[id].get.ts`. Lis l'id avec `getRouterParam(event, 'id')`. Si la tâche n'existe pas :

   ```ts
   throw createError({ status: 404, message: 'Tâche introuvable.' })
   ```

5. Crée `server/api/taches.post.ts`. Lis le corps avec `await readBody(event)`, puis valide `titre` (pense à `trim()`) :
   - titre absent ou vide → erreur 400 avec le message `Le titre est obligatoire.` ;
   - moins de 3 caractères → erreur 400 avec le message `Le titre doit faire au moins 3 caractères.`
6. Si le titre est valide, appelle `setResponseStatus(event, 201)` puis renvoie la tâche créée.
7. Teste dans le navigateur : `http://localhost:3000/api/taches?fait=false`.

> [!TIP]
> Mets le texte de l'erreur dans `message`, pas dans `statusMessage`. `statusMessage` va dans la ligne de statut HTTP, qui n'accepte pas les accents.

> [!NOTE]
> Les données sont en mémoire : elles reviennent à l'état de départ à chaque redémarrage du serveur.

## Lancer les tests

Depuis le dossier `tp/nuxt` :

```bash
npm test -- 03-api-taches
```

Ces tests construisent l'application puis démarrent un vrai serveur. Le démarrage prend 10 à 20 secondes.
Si une page de l'application ne compile pas, ces tests échouent aussi.

## Critères de réussite

- `GET /api/taches` renvoie les 3 tâches de départ.
- `GET /api/taches?fait=true` renvoie seulement les tâches faites.
- `GET /api/taches?fait=false` renvoie seulement les tâches à faire.
- `GET /api/taches/2` renvoie la tâche 2.
- `GET /api/taches/99` répond 404 avec le message « Tâche introuvable. ».
- `POST /api/taches` sans titre répond 400 avec « Le titre est obligatoire. ».
- `POST /api/taches` avec `{ "titre": "Ab" }` répond 400 avec « Le titre doit faire au moins 3 caractères. ».
- `POST /api/taches` avec un titre valide répond 201 et renvoie `{ id, titre, fait: false }` ; on retrouve ensuite la tâche avec `GET /api/taches/:id`.

## Pour aller plus loin

- Ajoute `server/api/taches/[id].patch.ts` pour cocher une tâche (`fait: true`).
- Ajoute `server/api/taches/[id].delete.ts` pour supprimer une tâche.
- Valide le corps avec `readValidatedBody(event, valider)` et une petite fonction de validation.
