# Route dynamique /produits/[id]

## Objectif

Afficher un petit catalogue : une page qui liste les produits, et une fiche pour chaque produit.
La fiche lit l'identifiant dans l'URL. Si le produit n'existe pas, l'application affiche une page d'erreur 404.

## Ce que tu vas pratiquer

- une route dynamique avec un fichier `[id].vue` ;
- la lecture d'un paramètre avec `useRoute()` ;
- l'auto-import des fonctions du dossier `app/utils/` ;
- les erreurs avec `createError()` et la page `app/error.vue` ;
- `clearError()` pour quitter la page d'erreur.

Revois si besoin [la leçon sur les pages et le routage](#/nuxt/lecon/02-pages-routage) et [la leçon sur les auto-imports](#/nuxt/lecon/03-composants-auto-imports).

## Fichiers à créer ou modifier

- `app/utils/produits.ts`
- `app/pages/produits/index.vue`
- `app/pages/produits/[id].vue`
- `app/error.vue`
- `app/layouts/default.vue` (à modifier)

## Étapes

1. Crée `app/utils/produits.ts`. Exporte un type `Produit` (`id`, `nom`, `prix`, `description`) et ce tableau :

   ```ts
   export const produits: Produit[] = [
     { id: 1, nom: 'Clavier', prix: 49, description: 'Un clavier mécanique compact.' },
     { id: 2, nom: 'Souris', prix: 25, description: 'Une souris sans fil, légère et précise.' },
     { id: 3, nom: 'Écran', prix: 199, description: 'Un écran de 27 pouces pour travailler confortablement.' },
   ]
   ```

2. Dans le même fichier, exporte `trouverProduit(id: number)`. Elle renvoie le produit, ou `undefined` s'il n'existe pas.
3. Crée `app/pages/produits/index.vue` :
   - un `<h1>Produits</h1>` ;
   - un `<li data-test="produit">` par produit ;
   - dans chaque `<li>`, un seul lien : `<NuxtLink>` vers `/produits/1`, `/produits/2`… avec le nom du produit.
4. Crée `app/pages/produits/[id].vue` :
   - lis l'id avec `useRoute().params.id` et convertis-le avec `Number(…)` ;
   - cherche le produit avec `trouverProduit()` (pas besoin d'import : `app/utils/` est auto-importé) ;
   - affiche le nom dans un `<h1>` et le prix dans `<p data-test="prix">25 €</p>`.
5. Toujours dans `[id].vue`, si le produit n'existe pas, lève l'erreur :

   ```ts
   throw createError({ status: 404, statusText: 'Produit introuvable', fatal: true })
   ```

6. Crée `app/error.vue`. Il reçoit la prop `error` (type `NuxtError`, importé depuis `#app`). Affiche :
   - `<h1 data-test="code-erreur">` avec `error.status` ;
   - `<p data-test="message-erreur">` avec `error.statusText` ;
   - `<button data-test="retour-accueil">Retour à l'accueil</button>`, qui appelle `clearError({ redirect: '/' })`.
7. Ajoute un lien « Produits » vers `/produits` dans la navigation du layout.
8. Teste dans le navigateur : `/produits/2`, puis `/produits/42`.

> [!WARNING]
> Sans `fatal: true`, une erreur levée pendant une navigation côté client n'affiche pas la page d'erreur.

> [!NOTE]
> `app/error.vue` remplace toute l'application : il n'utilise pas le layout.

## Lancer les tests

Depuis le dossier `tp/nuxt` :

```bash
npm test -- 02-route-dynamique
```

## Critères de réussite

- `app/utils/produits.ts` exporte les 3 produits (Clavier 49, Souris 25, Écran 199) et `trouverProduit()` ; `trouverProduit(42)` renvoie `undefined`.
- La page `/produits` a le titre « Produits » et trois `[data-test="produit"]`, avec un lien vers chaque fiche.
- La page `/produits/2` affiche « Souris » dans le `<h1>` et « 25 € » dans `[data-test="prix"]`.
- La page `/produits/42` lève une erreur 404, fatale, avec le texte « Produit introuvable ».
- `app/error.vue` affiche le code (`[data-test="code-erreur"]`) et le message (`[data-test="message-erreur"]`).
- Le bouton « Retour à l'accueil » efface l'erreur et ramène sur `/`.
- La navigation du layout contient un lien vers `/produits`.

## Pour aller plus loin

- Ajoute un lien « Produit suivant » sur la fiche.
- Dans la liste `/produits`, affiche les prix avec `Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })`.
- Vérifie que l'id est un nombre avec `definePageMeta({ validate: … })`.
