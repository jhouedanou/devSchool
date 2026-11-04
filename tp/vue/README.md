# TP Vue — devSchool

Ce dossier est un vrai projet Vue 3 (Vite + Vitest).
Il contient 7 travaux pratiques. Pour chaque TP, tu as :

- un énoncé (`enonces/`), aussi affiché sur le site ;
- des fichiers de départ à compléter (`exercices/`) ;
- des tests automatiques à faire passer (`tests/`) ;
- une solution (`solutions/`).

Tu codes dans ton éditeur. Les tests te disent quand c'est bon. La galerie te montre le résultat dans le navigateur.

## Installation

Il te faut Node.js 22.12 ou plus récent (`node --version`).

```bash
cd tp/vue
npm install
```

Versions utilisées : Vue 3.5, Pinia 4, Vue Router 5, Vite 8, Vitest 5, Vue Test Utils 2 et happy-dom (un faux navigateur pour les tests).

## Commandes

Toutes les commandes se lancent depuis `tp/vue`.

| Commande | Rôle |
|----------|------|
| `npm test` | lance tous les tests en mode « watch » : ils se relancent à chaque sauvegarde |
| `npm test -- 01-compteur` | lance seulement les tests d'un TP |
| `npm run test:run` | lance tous les tests une fois, puis s'arrête |
| `npm run dev` | ouvre la galerie : un menu des TP et ton composant en direct |
| `npm run dev:solutions` | la même galerie, avec les solutions |
| `npm run solutions` | vérifie que toutes les solutions passent les tests |
| `npm run build` | compile la galerie dans `dist/` |

En mode « watch », appuie sur `a` pour tout relancer, `f` pour relancer seulement les tests en échec, et `q` pour quitter.

Pour lancer un seul test par son nom : `npm test -- 01-compteur -t "Réinitialiser"`.

## Organisation

```
tp/vue/
  enonces/<id>.md          énoncé du TP
  exercices/<id>/…         ton code : c'est ici que tu travailles
  solutions/<id>/…         les mêmes fichiers, complets
  tests/<id>.test.js       les tests du TP
  src/                     la galerie (npm run dev) : tu n'as pas besoin d'y toucher
  public/api/              fausses données JSON servies par la galerie (TP 05)
  vite.config.js           configuration de Vite et de Vitest
```

Les tests importent ton code avec l'alias `@tp` :

```js
import Compteur from '@tp/01-compteur/Compteur.vue'
```

`@tp` pointe vers `exercices/`. Avec l'option `--mode solution`, il pointe vers `solutions/`.
C'est comme ça que `npm run solutions` et `npm run dev:solutions` fonctionnent (sous Windows, macOS et Linux).

## Les TP

| Id | Titre | Niveau |
|----|-------|--------|
| `01-compteur` | Compteur borné | 1 |
| `02-todo-list` | Liste de tâches | 1 |
| `03-catalogue-produits` | Catalogue : props et événements | 2 |
| `04-formulaire-inscription` | Formulaire d'inscription validé | 2 |
| `05-composable-fetch` | Composable useFetch | 2 |
| `06-panier-pinia` | Panier avec Pinia | 3 |
| `07-mini-blog-router` | Mini-blog avec Vue Router | 3 |

## Comment travailler

1. Lis l'énoncé du TP (sur le site ou dans `enonces/`).
2. Ouvre deux terminaux dans `tp/vue` :
   - `npm test -- 01-compteur` pour les tests ;
   - `npm run dev` pour voir ton composant.
3. Complète les `// TODO` des fichiers de `exercices/01-compteur/`.
4. Sauvegarde : les tests et la page se mettent à jour.
5. Quand tout est vert, compare avec `solutions/01-compteur/`.

## Conseils

- Au départ, la plupart des tests sont rouges. C'est normal : fais-les passer un par un.
- Lis le message d'erreur en entier. Il montre la valeur attendue (`Expected`) et la valeur obtenue (`Received`).
- Ouvre le fichier de test. Il montre exactement ce qui est vérifié et avec quels sélecteurs.
- Garde les attributs `data-test="…"` du code de départ : les tests s'en servent pour trouver les éléments.
- Essaie avant de regarder la solution. Si tu bloques, relis la leçon liée dans l'énoncé.
- Pour recommencer un TP, remets le fichier d'origine : `git checkout -- exercices/01-compteur`.
- Les tests ne doivent pas être modifiés pour passer. Si un test te semble faux, relis l'énoncé.
