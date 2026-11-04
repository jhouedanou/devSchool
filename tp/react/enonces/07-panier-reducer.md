# Panier avec useReducer

## Objectif

Tu gères un panier d'achat avec `useReducer`. Toute la logique (ajouter, retirer, changer une quantité, vider) vit dans une fonction pure : le reducer. Tu le testes d'abord seul, sans React. Puis tu le branches dans le composant `Panier`.

## Ce que tu vas pratiquer

- Écrire un reducer pur et immuable avec `switch`.
- Décrire les changements avec des actions `{ type, … }`.
- `useReducer` et `dispatch`.
- Une valeur dérivée : le total, calculé à partir des articles.
- Tester une fonction pure sans rien afficher.

Revois si besoin [la leçon sur useReducer et les hooks avancés](#/react/lecon/07-hooks-avances).

## Fichiers à modifier

- `exercices/07-panier-reducer/panierReducer.js`
- `exercices/07-panier-reducer/Panier.jsx`

## Étapes

1. Dans `panierReducer`, écris le cas `'ajouter'`. Un produit absent arrive avec `quantite: 1`. Un produit déjà présent voit sa quantité augmenter de 1.
2. Écris `'retirer'` (avec `filter`) et `'vider'`.
3. Écris `'changerQuantite'`. Si la quantité vaut 0 ou moins, retire l'article.
4. Dans le cas `default`, lève une erreur `Action inconnue : <type>`.
5. Écris `calculerTotal(articles)` avec `reduce`.
6. Lance les tests : la partie « panierReducer (sans React) » doit passer.
7. Dans `Panier.jsx`, remplace `articles` et `dispatch` par `useReducer(panierReducer, etatInitial)`.
8. Branche chaque bouton sur la bonne action. Désactive « Vider le panier » quand le panier est vide.

Les actions :

| Action | Forme exacte |
|--------|--------------|
| Ajouter | `{ type: 'ajouter', produit: { id, nom, prix } }` |
| Retirer | `{ type: 'retirer', id }` |
| Changer la quantité | `{ type: 'changerQuantite', id, quantite }` |
| Vider | `{ type: 'vider' }` |

L'état a la forme `{ articles: [{ id, nom, prix, quantite }] }`.

Garde ces textes, les tests les utilisent :

| Élément | Texte exact |
|---------|-------------|
| Ajouter au panier | bouton `aria-label="Ajouter Clavier"` |
| Quantité | boutons `aria-label="Augmenter la quantité de Clavier"` et `aria-label="Diminuer la quantité de Clavier"` |
| Retirer | bouton `aria-label="Retirer Clavier"` |
| Vider | bouton `Vider le panier` |
| Liste | `<ul aria-label="Articles du panier">` |
| Panier vide | `Ton panier est vide.` |
| Total | `Total : 119,30 €` (avec `formaterPrix`, déjà écrite) |

> [!WARNING]
> Un reducer ne modifie jamais l'état reçu. Pas de `push`, pas de `splice`, pas de `article.quantite++`. Les tests gèlent l'état avec `Object.freeze` : toute modification lève une erreur.

## Lancer les tests

Depuis le dossier `tp/react` :

```bash
npm test -- 07-panier-reducer
```

## Critères de réussite

- `'ajouter'` met un nouveau produit dans le panier avec la quantité 1.
- `'ajouter'` un produit déjà présent augmente sa quantité, sans doublon.
- Le reducer ne modifie jamais l'état reçu et renvoie un nouvel objet.
- `'retirer'` enlève l'article.
- `'changerQuantite'` change la quantité, et une quantité de 0 retire l'article.
- `'vider'` vide le panier.
- Une action inconnue lève l'erreur « Action inconnue : payer ».
- Le composant affiche un panier vide au départ, un total de 0,00 € et un bouton « Vider le panier » désactivé.
- Ajouter des produits met à jour les lignes et le total.
- Les boutons + et -, « Retirer » et « Vider le panier » mettent à jour le panier.

## Pour aller plus loin

- Partage le panier dans toute l'application avec un Context (voir le TP 05).
- Garde le panier dans `localStorage` (voir le TP 06).
- Ajoute un code promo : une action `appliquerCode` qui retire 10 % du total.
