# Mini-blog avec Vue Router

## Objectif

Tu crées un petit blog avec trois pages :
l'accueil (la liste des articles), la page d'un article et une page 404.
Chaque page a son adresse : `/`, `/articles/2`, et n'importe quelle autre adresse pour la 404.

## Ce que tu vas pratiquer

- déclarer des routes, avec un paramètre (`:id`) et une route « attrape-tout » ;
- `<RouterView>` et `<RouterLink>` ;
- lire un paramètre avec `useRoute()` ;
- garder une page à jour quand seul le paramètre change ;
- tester avec `createRouter`, `createMemoryHistory` et `router.isReady()`.

Leçon utile : [Vue Router](#/vue/lecon/09-router).

## Fichiers à modifier

- `exercices/07-mini-blog-router/router.js`
- `exercices/07-mini-blog-router/App.vue`
- `exercices/07-mini-blog-router/pages/Accueil.vue`
- `exercices/07-mini-blog-router/pages/Article.vue`
- `exercices/07-mini-blog-router/pages/PageIntrouvable.vue`

Le fichier `articles.js` est prêt : il contient les articles et la fonction `trouverArticle(id)`.

## Étapes

1. Dans `router.js`, ajoute la route `article` (`/articles/:id`) et la route `introuvable` (`/:pathMatch(.*)*`), en dernier.
2. Dans `App.vue`, ajoute `<RouterView />` dans `<main>`.
3. Dans `Accueil.vue`, affiche un `<RouterLink>` par article, vers `/articles/:id`.
4. Dans `Article.vue`, lis l'id avec `useRoute()` et trouve l'article avec un `computed`.
   Affiche le titre et le contenu, ou « Article introuvable » si l'id n'existe pas.
5. Dans `PageIntrouvable.vue`, affiche « Page introuvable » et un lien vers l'accueil.

Noms des routes : `accueil`, `article`, `introuvable`.

Les tests utilisent ces sélecteurs :

| Élément | Sélecteur |
|---------|-----------|
| Lien vers un article (accueil) | `[data-test="lien-article"]` |
| Titre de l'article | `[data-test="titre"]` |
| Contenu de l'article | `[data-test="contenu"]` |

Les tests cherchent aussi les textes « Article introuvable » et « Page introuvable ».

> [!WARNING]
> Quand on passe de `/articles/1` à `/articles/2`, Vue Router garde le même composant `Article`.
> `setup()` ne repasse pas. Une simple variable `const id = route.params.id` ne change donc pas : utilise un `computed`.

> [!NOTE]
> `route.params.id` est toujours une chaîne (`'2'`, pas `2`). `trouverArticle()` fait la conversion pour toi.

## Lancer les tests

Depuis le dossier `tp/vue` :

```bash
npm test -- 07-mini-blog-router
```

Dans la galerie (`npm run dev`), le blog utilise des adresses en `#/…` : tu peux taper `#/articles/2` dans la barre d'adresse.

## Critères de réussite

- L'accueil liste tous les articles, avec leur titre.
- Chaque lien pointe vers `/articles/:id`.
- `/articles/2` affiche le titre de l'article 2.
- Un id inconnu (`/articles/999`) affiche « Article introuvable ».
- La page se met à jour quand on passe d'un article à un autre.
- Un clic sur un lien de l'accueil ouvre l'article.
- Une adresse inconnue affiche « Page introuvable ».

## Pour aller plus loin

- Ajoute des liens « Article précédent » et « Article suivant ».
- Change le titre de l'onglet (`document.title`) avec `router.afterEach`.
- Charge les pages à la demande : `component: () => import('./pages/Article.vue')`.
