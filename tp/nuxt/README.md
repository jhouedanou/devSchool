# TP Nuxt

Ce dossier est une vraie application Nuxt 4. Tu la complètes TP après TP.
Chaque TP a un énoncé, des tests automatiques et une solution.

## Prérequis

- Node.js 22.22 ou plus récent (la version LTS 24 convient).
- npm (installé avec Node.js).
- Un éditeur avec l'extension Vue (Vue - Official pour VS Code).

## Installation

```bash
cd tp/nuxt
npm install
```

`npm install` lance aussi `nuxt prepare`, qui génère les types dans `.nuxt/`.

## Commandes

| Commande | Rôle |
|----------|------|
| `npm run dev` | lance l'application sur http://localhost:3000 |
| `npm test` | lance tous les tests en mode watch (ils se relancent quand tu modifies un fichier) |
| `npm test -- 03-api-taches` | lance seulement les tests d'un TP |
| `npm run test:run` | lance tous les tests une seule fois |
| `npm run build` | construit l'application pour la production |
| `npm run solutions` | vérifie que les solutions passent les tests (ton code n'est pas modifié) |

En mode watch, appuie sur `h` pour voir les raccourcis et sur `q` pour quitter.

## Organisation

```
tp/nuxt/
  app/                    ton application (pages, layouts, composants, composables…)
    app.vue               point d'entrée, à modifier dès le TP 01
    assets/css/           styles de base
  server/                 routes API (TP 03)
  enonces/<id>.md         énoncé de chaque TP (aussi affiché sur le site)
  tests/<id>.test.ts      tests de chaque TP
  tests/outils.ts         fonctions communes aux tests
  solutions/<id>/         fichiers de la solution, aux mêmes chemins que dans le projet
  scripts/verifier-solutions.mjs
  nuxt.config.ts, vitest.config.ts, tsconfig.json
```

Au départ, l'application ne contient presque rien : `app/app.vue` et une feuille de style.
Tu crées les autres fichiers en suivant les énoncés.

## Les TP

Fais-les dans l'ordre : chaque TP s'appuie sur les précédents. Les énoncés sont dans `enonces/` et sur le site.

| TP | Titre | Niveau |
|----|-------|--------|
| [01-pages-layout](#/nuxt/tp/01-pages-layout) | Pages et layout | 1 |
| [02-route-dynamique](#/nuxt/tp/02-route-dynamique) | Route dynamique /produits/[id] | 1 |
| [03-api-taches](#/nuxt/tp/03-api-taches) | API serveur de tâches | 2 |
| [04-usefetch-taches](#/nuxt/tp/04-usefetch-taches) | Afficher les tâches avec useFetch | 2 |
| [05-etat-panier](#/nuxt/tp/05-etat-panier) | État partagé avec useState | 2 |
| [06-middleware-auth](#/nuxt/tp/06-middleware-auth) | Middleware d'authentification | 3 |

Pour chaque TP :

1. Lis l'énoncé.
2. Lance les tests du TP : ils échouent, c'est normal.
3. Code, puis relance les tests jusqu'à ce qu'ils passent tous.
4. Vérifie aussi le résultat dans le navigateur avec `npm run dev`.
5. Compare avec la solution dans `solutions/<id>/`.

## Comment marchent les tests

Les tests utilisent [Vitest](https://vitest.dev) et [@nuxt/test-utils](https://nuxt.com/docs/getting-started/testing). Il y a deux familles :

- **Tests de l'application** (TP 01, 02, 04, 05, 06). Ils tournent dans un environnement Nuxt simulé : les auto-imports, le routeur et `useState` fonctionnent. Les composants sont montés avec `mountSuspended()`. Au TP 04, `registerEndpoint()` remplace ton API par une fausse route. Durée : environ 5 secondes.
- **Tests du serveur** (TP 03). Ils construisent l'application, démarrent un vrai serveur, puis appellent ton API en HTTP. Durée : environ 15 secondes, surtout pour la construction.

Les tests cherchent des éléments précis : textes, chemins et attributs `data-test`. L'énoncé les donne tous. Respecte-les exactement.

## Lire un échec

- `Fichier introuvable : app/pages/index.vue` : le fichier n'existe pas encore, ou son nom est différent. Vérifie le chemin et les majuscules.
- `doit exporter une fonction nommée « usePanier »` : le fichier existe, mais l'export manque ou porte un autre nom.
- `expected '…' to be '…'` : le test a trouvé une autre valeur. Compare le texte attendu et le texte reçu.
- Un message ajouté par le test (par ex. `il manque data-test="erreur"`) dit directement quoi corriger.
- Au TP 03, si tous les tests échouent avant même de s'exécuter, la construction a raté : lance `npm run build` pour voir l'erreur.

## Conseils

- **Relance les tests après avoir créé un fichier.** Nuxt calcule les routes, les layouts, les composants et les middlewares au démarrage des tests. Un nouveau fichier dans `app/pages/`, `app/layouts/`, `app/components/`, `app/composables/` ou `app/middleware/` n'est pas vu tant que tu n'as pas relancé : quitte avec `q`, puis relance `npm test -- <id>`. Une simple modification d'un fichier existant, elle, relance les tests toute seule.
- Ne modifie pas les fichiers de `tests/`. Si un test te semble faux, relis l'énoncé.
- Les tests d'un TP restent valables pour la suite : à la fin, `npm run test:run` doit tout passer.
- `npm run dev` et `npm test` peuvent tourner en même temps, dans deux terminaux.
- Pour recommencer un TP, supprime tes fichiers ou reviens en arrière avec git.

## Vérifier les solutions

```bash
npm run solutions
```

Le script copie le projet dans un dossier temporaire, applique les solutions de 01 à 06 dans l'ordre, puis lance tous les tests. Ton code n'est jamais touché. Options :

```bash
npm run solutions -- --jusqua=03   # applique 01 à 03 et lance les tests de ces TP
npm run solutions -- --build       # lance aussi « nuxt build » à la fin
npm run solutions -- --depart      # vérifie que chaque fichier de test échoue sur le projet de départ
npm run solutions -- --garder      # garde le dossier temporaire pour l'explorer
```

## Pour aller plus loin

- [La leçon sur les tests avec Nuxt](#/nuxt/lecon/10-tests) explique `mountSuspended`, `mockNuxtImport` et `registerEndpoint`.
- Lis les fichiers de `tests/` : ce sont de bons exemples de tests Nuxt.
