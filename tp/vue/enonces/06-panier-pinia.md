# Panier avec Pinia

## Objectif

Tu crées un store Pinia pour un panier d'achat : des articles, des actions et des getters.
Puis tu l'affiches dans un composant `Panier.vue`.
Dans la galerie, une petite boutique ajoute des produits dans le même store : tu vois les deux composants partager les données.

## Ce que tu vas pratiquer

- un store « setup » avec `defineStore('panier', () => { … })` ;
- l'état (`ref`), les getters (`computed`) et les actions (fonctions) ;
- `storeToRefs()` pour déstructurer sans perdre la réactivité ;
- tester un store avec `setActivePinia(createPinia())`.

Leçon utile : [Pinia](#/vue/lecon/10-pinia).

## Fichiers à modifier

- `exercices/06-panier-pinia/stores/panier.js`
- `exercices/06-panier-pinia/Panier.vue`

## Étapes

1. Dans le store, écris `ajouter(produit)`. `produit` vaut `{ id, nom, prix }`.
   S'il est déjà dans le panier, augmente sa quantité. Sinon, ajoute `{ id, nom, prix, quantite: 1 }`.
2. Écris `retirer(id)` : enlève toute la ligne de cet article.
3. Écris `vider()`.
4. Écris les getters `total` (somme de `prix × quantite`) et `nombreArticles` (somme des quantités).
5. Dans `Panier.vue`, récupère `articles`, `total` et `nombreArticles` avec `storeToRefs()`, et les actions directement depuis le store.
6. Affiche « Ton panier est vide. » si le panier est vide. Sinon, affiche les lignes, le total et le bouton « Vider le panier ».

Les tests utilisent ces sélecteurs :

| Élément | Sélecteur |
|---------|-----------|
| Message « Ton panier est vide. » | `[data-test="vide"]` |
| Une ligne d'article (`<li>`) | `[data-test="article"]` |
| Quantité d'une ligne (le nombre seul) | `[data-test="quantite"]` |
| Bouton « Retirer » d'une ligne | `[data-test="retirer"]` |
| Total (prix formaté seul) | `[data-test="total"]` |
| Bouton « Vider le panier » | `[data-test="vider"]` |
| Nombre d'articles (facultatif) | `[data-test="nombre"]` |

> [!TIP]
> `const { total } = panier` perd la réactivité : `total` devient un simple nombre. `storeToRefs(panier)` renvoie des refs qui restent à jour.

## Lancer les tests

Depuis le dossier `tp/vue` :

```bash
npm test -- 06-panier-pinia
```

Pour voir le panier dans le navigateur : `npm run dev`.

## Critères de réussite

- Le store démarre vide : aucun article, `total` à 0, `nombreArticles` à 0.
- `ajouter()` ajoute un produit avec la quantité 1.
- `ajouter()` du même produit augmente sa quantité, sans créer une deuxième ligne.
- `total` et `nombreArticles` sont justes (2 stylos à 1,50 € + 1 cahier à 3,20 € = 6,20 €, 3 articles).
- `retirer()` enlève l'article.
- `vider()` vide le panier.
- Le composant affiche « Ton panier est vide. » quand il n'y a rien.
- Le composant affiche une ligne par article, sa quantité et le total en euros.
- Les boutons « Retirer » et « Vider le panier » modifient le store.

## Pour aller plus loin

- Ajoute des boutons « + » et « − » sur chaque ligne (une action `diminuer(id)`).
- Sauvegarde le panier dans `localStorage` avec `panier.$subscribe()`.
- Réécris le store en version « options » (`state`, `getters`, `actions`) et compare.
