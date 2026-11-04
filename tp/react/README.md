# TP React

Projet de travaux pratiques du parcours React de devSchool. Tu codes en local, dans un vrai projet Vite + React 19. Des tests automatiques (Vitest + Testing Library) te disent quand ton TP est terminé.

## Installation

Il te faut Node.js 24 LTS (ou au minimum 22.22). Vérifie avec `node -v`.

```bash
cd tp/react
npm install
```

## Commandes

| Commande | Rôle |
|----------|------|
| `npm test` | Lance tous les tests et les relance à chaque sauvegarde (mode watch). |
| `npm test -- 01-compteur` | Lance seulement les tests d'un TP. |
| `npm run test:run` | Lance tous les tests une fois, puis s'arrête. |
| `npm run solutions` | Lance les tests sur les solutions. Tout doit passer. |
| `npm run dev` | Ouvre la galerie : un menu des TP qui affiche ton code en direct. |
| `npm run dev:solution` | Ouvre la galerie avec les solutions. |
| `npm run build` | Compile la galerie dans `dist/`. |

Toutes les commandes marchent sous Windows, macOS et Linux.

## Organisation

```
tp/react/
  enonces/<id>.md          énoncé de chaque TP (aussi affiché sur le site)
  exercices/<id>/          ton code : c'est ici que tu travailles
  solutions/<id>/          les solutions complètes
  tests/<id>.test.jsx      les tests de chaque TP
  tests/setup.js           configuration commune des tests
  src/                     la galerie (menu + démo de chaque TP)
  vite.config.js           configuration de Vite et de Vitest
```

Les tests et la galerie importent les composants avec l'alias `@tp` :

```js
import Compteur from '@tp/01-compteur/Compteur.jsx';
```

Par défaut, `@tp` pointe vers `exercices/`. Avec `--mode solution` (`npm run solutions`, `npm run dev:solution`), il pointe vers `solutions/`. Les mêmes tests vérifient donc ton code et la solution.

## Les TP

| Id | Titre | Niveau |
|----|-------|--------|
| `01-compteur` | Compteur avec historique | 1 |
| `02-todo-list` | Liste de tâches | 1 |
| `03-formulaire-contact` | Formulaire de contact validé | 2 |
| `04-liste-utilisateurs` | Liste d'utilisateurs avec fetch | 2 |
| `05-theme-context` | Thème clair/sombre avec Context | 2 |
| `06-hook-local-storage` | Hook useLocalStorage | 2 |
| `07-panier-reducer` | Panier avec useReducer | 3 |
| `08-actions-react19` | Formulaire avec useActionState (React 19) | 3 |

## Comment travailler

1. Lis l'énoncé (`enonces/<id>.md` ou sur le site).
2. Ouvre deux terminaux dans `tp/react` :
   - `npm run dev` pour voir ton composant dans la galerie ;
   - `npm test -- <id>` pour suivre les tests.
3. Modifie les fichiers de `exercices/<id>/`. Suis les commentaires `// TODO`.
4. Le TP est fini quand tous ses tests sont verts.

Au départ, la plupart des tests échouent. C'est normal.

## Conseils

- Ne modifie pas les tests. Lis-les : ils montrent ce qui est attendu.
- Garde les textes imposés par l'énoncé (boutons, labels). Les tests cherchent les éléments comme un utilisateur : par leur rôle, leur label ou leur texte.
- Lis le premier message d'erreur en entier. Testing Library affiche le HTML rendu : compare-le avec ce que tu attendais.
- Appuie sur `p` dans le mode watch pour filtrer par nom de fichier, ou sur `t` pour filtrer par nom de test.
- Bloqué ? Compare avec `solutions/<id>/`, mais essaie d'abord seul quelques minutes.
- Pour repartir de zéro sur un TP : `git checkout -- exercices/<id>`.
