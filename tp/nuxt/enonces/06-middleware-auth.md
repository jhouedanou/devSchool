# Middleware d'authentification

## Objectif

Protéger la page `/compte`. Si personne n'est connecté, l'application redirige vers `/connexion`.
La connexion est simulée : il suffit de taper son nom.

## Ce que tu vas pratiquer

- un composable `useAuth()` basé sur `useState` ;
- un middleware de route nommé avec `defineNuxtRouteMiddleware` ;
- la redirection avec `navigateTo()` ;
- l'activation d'un middleware sur une page avec `definePageMeta()`.

Revois si besoin [la leçon sur les middlewares et les plugins](#/nuxt/lecon/07-middleware-plugins) et [la leçon sur l'état](#/nuxt/lecon/05-etat).

## Fichiers à créer ou modifier

- `app/composables/useAuth.ts`
- `app/middleware/auth.ts`
- `app/pages/compte.vue`
- `app/pages/connexion.vue`
- `app/layouts/default.vue` (à modifier)

## Étapes

1. Crée `app/composables/useAuth.ts` et exporte `useAuth()`. Elle contient :
   - `utilisateur` : `useState<{ nom: string } | null>('utilisateur', () => null)`. Une fois connecté, il vaut `{ nom: 'Ada' }` ;
   - `estConnecte` : une `computed` qui vaut `true` si `utilisateur` n'est pas `null` ;
   - `connecter(nom)` et `deconnecter()`.
2. Crée `app/middleware/auth.ts` avec `export default defineNuxtRouteMiddleware(() => { … })`. Si personne n'est connecté, renvoie `navigateTo('/connexion')`.
3. Crée `app/pages/compte.vue` :
   - active le middleware : `definePageMeta({ middleware: 'auth' })` ;
   - affiche `<h1>Mon compte</h1>` et `<p data-test="bienvenue">Bonjour Ada !</p>` (avec le vrai nom) ;
   - ajoute `<button data-test="deconnexion">Se déconnecter</button>`. Au clic : `deconnecter()`, puis `navigateTo('/connexion')`.
4. Crée `app/pages/connexion.vue` :
   - affiche `<h1>Connexion</h1>` ;
   - ajoute `<form data-test="formulaire-connexion">` avec `<input data-test="nom">` et un bouton « Se connecter » ;
   - à l'envoi : enlève les espaces du nom (`trim()`). S'il est vide, ne fais rien. Sinon, appelle `connecter(nom)` puis `navigateTo('/compte')`.
5. Ajoute un lien « Mon compte » vers `/compte` dans la navigation du layout.
6. Lance `npm run dev` et ouvre `/compte` : tu arrives sur `/connexion`. Connecte-toi, puis déconnecte-toi.

> [!NOTE]
> Le nom du fichier donne le nom du middleware : `auth.ts` s'utilise avec `middleware: 'auth'`.

> [!WARNING]
> Dans un middleware, renvoie le résultat : `return navigateTo('/connexion')`. Sans `return`, la navigation vers `/compte` continue.

## Lancer les tests

Depuis le dossier `tp/nuxt` :

```bash
npm test -- 06-middleware-auth
```

## Critères de réussite

- `useAuth()` : au départ, `utilisateur` vaut `null` et `estConnecte` vaut `false`.
- `connecter('Ada')` donne `utilisateur` = `{ nom: 'Ada' }` ; `deconnecter()` remet `null`. L'état est partagé.
- `/compte` redirige vers `/connexion` si personne n'est connecté.
- `/compte` affiche « Mon compte » et « Bonjour Ada ! » quand Ada est connectée.
- Le formulaire de `/connexion` connecte l'utilisateur et ouvre `/compte`.
- Un nom vide (ou seulement des espaces) ne connecte personne.
- Le bouton « Se déconnecter » déconnecte et renvoie vers `/connexion`.

## Pour aller plus loin

- Après la connexion, renvoie l'utilisateur vers la page qu'il voulait voir : `navigateTo({ path: '/connexion', query: { redirection: to.fullPath } })`.
- Affiche « Connecté : Ada » dans l'en-tête du layout quand quelqu'un est connecté.
- Crée un middleware global `app/middleware/journal.global.ts` qui affiche chaque navigation dans la console.
