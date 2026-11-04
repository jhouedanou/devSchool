# Liste d'utilisateurs avec fetch

## Objectif

Tu affiches une liste d'utilisateurs chargée depuis une API avec `fetch`. Le composant gère trois états : chargement, erreur et liste. Un champ filtre la liste par nom. Un bouton « Recharger » relance la requête.

## Ce que tu vas pratiquer

- `useEffect` pour charger des données au montage.
- `fetch`, `response.ok` et `response.json()` avec `async` / `await`.
- Les états de chargement et d'erreur.
- La fonction de nettoyage d'un effet, pour ignorer une réponse arrivée trop tard.
- Les dépendances d'un effet, pour le relancer.
- Des tests asynchrones avec un faux `fetch`.

Revois si besoin [la leçon sur les effets](#/react/lecon/06-effets).

## Fichiers à modifier

- `exercices/04-liste-utilisateurs/ListeUtilisateurs.jsx`

## Étapes

1. Dans l'effet, écris une fonction `async function charger()` et appelle-la tout de suite.
2. Appelle `fetch('/api/utilisateurs')`. Si `reponse.ok` vaut `false`, lève une erreur avec le message `Erreur HTTP 500` (le nombre vient de `reponse.status`).
3. Sinon, lis le JSON et range-le dans `utilisateurs`.
4. En cas d'erreur (HTTP ou réseau), range `e.message` dans `erreur`. À la fin, passe `chargement` à `false`.
5. Ajoute une variable `ignorer` et une fonction de nettoyage qui la passe à `true`. Ne mets rien à jour si `ignorer` vaut `true`.
6. Rends le champ de filtre contrôlé. Garde les noms qui contiennent le filtre, sans tenir compte des majuscules.
7. Écris `recharger()` : remets `chargement` à `true`, `erreur` à `null`, puis augmente `version`. Comme `version` est dans les dépendances, l'effet se relance.
8. Affiche le bon contenu selon l'état.

L'API renvoie un tableau comme celui-ci :

```json
[{ "id": 1, "nom": "Alice Martin", "email": "alice@exemple.fr" }]
```

Garde ces textes, les tests les utilisent :

| État | Affichage exact |
|------|-----------------|
| Chargement | `<p>Chargement en cours</p>` |
| Erreur | `<p role="alert">Impossible de charger les utilisateurs (Erreur HTTP 500).</p>` |
| Filtre sans résultat | `<p>Aucun utilisateur ne correspond.</p>` |
| Liste | `<ul aria-label="Utilisateurs">` avec un `<li>` par nom |
| Champ | label `Filtrer par nom` |
| Bouton | `Recharger` |

> [!NOTE]
> Dans la galerie (`npm run dev`), `vite.config.js` simule l'API `/api/utilisateurs` avec un petit délai. Dans les tests, `fetch` est remplacé par une fausse fonction : `vi.stubGlobal('fetch', vi.fn(...))`.

> [!WARNING]
> Une fonction passée à `useEffect` ne peut pas être `async`. Elle doit renvoyer rien ou une fonction de nettoyage. Écris la fonction `async` à l'intérieur.

## Lancer les tests

Depuis le dossier `tp/react` :

```bash
npm test -- 04-liste-utilisateurs
```

## Critères de réussite

- « Chargement en cours » s'affiche, puis la liste des utilisateurs.
- `fetch` est appelé une seule fois, sur `/api/utilisateurs`.
- Si la réponse HTTP n'est pas OK, une alerte affiche « Impossible de charger les utilisateurs » et « Erreur HTTP 500 ». La liste n'est pas affichée.
- Si le réseau échoue, la même alerte s'affiche.
- Le filtre garde les noms qui contiennent le texte, sans tenir compte des majuscules.
- Si le filtre ne trouve rien, « Aucun utilisateur ne correspond. » s'affiche.
- « Recharger » relance la requête et affiche les nouvelles données.

## Pour aller plus loin

- Remplace la variable `ignorer` par un `AbortController` et passe son `signal` à `fetch`.
- Déplace la logique dans un hook `useFetch(url)` qui renvoie `{ donnees, chargement, erreur }`.
- Relis [la leçon sur React 19](#/react/lecon/11-react19-tests) : avec `use()` et `<Suspense>`, le chargement peut s'écrire autrement.
