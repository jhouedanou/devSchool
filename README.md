# devSchool

Un site pour **réapprendre Vue, Nuxt, React et Laravel**, dans cet ordre.

Chaque parcours contient :

- des **leçons** courtes, en français simple ;
- un **quiz** par leçon (il faut 70 % pour le valider) et un **examen final** ;
- des **exercices de code dans le navigateur**, corrigés par des tests automatiques ;
- des **travaux pratiques (TP)** dans de vrais projets, sur ta machine, avec de vrais tests (Vitest, PHPUnit).

Ta progression est enregistrée dans ton navigateur (`localStorage`). Tu peux l'exporter et l'importer depuis la page « Ma progression ».

## Lancer le site

Il faut Node.js (18 ou plus suffit pour le site). Il n'y a rien à installer pour le site.

```bash
git clone https://github.com/jhouedanou/devSchool.git
cd devSchool
npm run dev
```

Ouvre ensuite <http://localhost:8080>.

> Le site est statique : n'importe quel serveur de fichiers marche (`python3 -m http.server 8080` par exemple).
> Il ne marche pas en ouvrant `index.html` directement (`file://`), car il charge des modules JavaScript.

Les exercices du navigateur ont besoin d'internet : Vue, React et Babel sont chargés depuis un CDN (unpkg).

## Faire les TP

Chaque parcours a son projet dans `tp/` :

| Parcours | Dossier | Outils | Prérequis |
|----------|---------|--------|-----------|
| Vue | `tp/vue` | Vite 8, Vitest 5, Vue Test Utils, Pinia, Vue Router | Node.js 22.12+ |
| Nuxt | `tp/nuxt` | Nuxt 4.6, @nuxt/test-utils | Node.js 22.22+ |
| React | `tp/react` | Vite 8, Vitest 5, Testing Library, React 19 | Node.js 22.22+ |
| Laravel | `tp/laravel` | Laravel 13, PHPUnit 12 | PHP 8.3+, Composer |

Le plus simple : installe **Node.js 24 LTS**, il convient à tous les projets.

Le principe est le même partout :

1. ouvre l'énoncé du TP sur le site (ou dans `tp/<parcours>/enonces/`) ;
2. code dans le projet ;
3. lance les tests du TP : quand ils passent tous, le TP est fini ;
4. compare avec la solution dans `tp/<parcours>/solutions/` si tu bloques.

Le `README.md` de chaque dossier `tp/<parcours>/` donne les commandes exactes.

## Organisation du dépôt

```text
index.html             le site (une seule page)
app/                   le moteur du site (JavaScript sans build)
  runner/              exécution des exercices dans une iframe isolée
content/
  catalogue.js         ordre des parcours
  <parcours>/          leçons (.md), quiz (.js), exercices (.js)
tp/<parcours>/         projets de travaux pratiques
scripts/               serveur local et vérifications du contenu
docs/FORMAT-CONTENU.md format des leçons, quiz, exercices et TP
```

## Vérifier le contenu

```bash
npm run verifier                # structure des leçons, quiz et exercices
npm run verifier:exercices      # exécute chaque exercice dans Chromium (Playwright)
```

`verifier:exercices` vérifie que chaque solution passe tous ses tests et que chaque code de départ en rate au moins un.

## Publier le site

Le dépôt peut être servi tel quel par GitHub Pages (branche `main`, dossier racine). Le fichier `.nojekyll` empêche Jekyll de transformer les fichiers Markdown.

## Ajouter du contenu

Lis [`docs/FORMAT-CONTENU.md`](docs/FORMAT-CONTENU.md). Il décrit le format des leçons, des quiz, des exercices (et l'API de leurs tests) et des TP.
