# Catalogue : props et événements

## Objectif

Tu découpes une page de boutique en deux composants.
`ProduitCarte` affiche un produit et prévient son parent quand on clique sur « Ajouter au panier ».
`Catalogue` affiche la liste des cartes, un champ de recherche et le total du panier.

Les données descendent par les **props**. Les actions remontent par les **événements**.

## Ce que tu vas pratiquer

- déclarer une prop objet avec `defineProps` ;
- émettre un événement avec `defineEmits` ;
- écouter l'événement d'un enfant (`@ajouter`) ;
- filtrer une liste avec un `computed` ;
- formater un prix en euros avec `Intl.NumberFormat`.

Leçon utile : [les composants](#/vue/lecon/05-composants).

## Fichiers à modifier

- `exercices/03-catalogue-produits/ProduitCarte.vue`
- `exercices/03-catalogue-produits/Catalogue.vue`

Le fichier `prix.js` est prêt : `formaterPrix(34.5)` renvoie « 34,50 € ».
Le fichier `produits.js` contient les produits affichés dans la galerie.

## Étapes

1. Dans `ProduitCarte.vue`, déclare la prop `produit` (objet obligatoire) : `{ id, nom, prix, stock }`.
2. Déclare l'événement `ajouter`.
3. Affiche le nom et le prix formaté avec `formaterPrix()`.
4. Si le stock est à 0, affiche « Rupture de stock » et désactive le bouton.
5. Au clic sur le bouton, émets `ajouter` avec l'id du produit.
6. Dans `Catalogue.vue`, crée le `computed` `produitsFiltres` : les produits dont le nom contient le texte cherché, sans tenir compte des majuscules.
7. Affiche `produitsFiltres` avec `ProduitCarte` et écoute `@ajouter`.
8. Si aucun produit ne correspond, affiche « Aucun produit ne correspond à ta recherche. ».
9. Garde les produits ajoutés dans un ref et affiche le total du panier.

Les tests utilisent ces sélecteurs :

| Élément | Sélecteur |
|---------|-----------|
| Racine de la carte | `[data-test="produit"]` |
| Nom du produit | `[data-test="nom"]` |
| Prix formaté | `[data-test="prix"]` |
| Message « Rupture de stock » | `[data-test="rupture"]` |
| Bouton « Ajouter au panier » | `[data-test="ajouter"]` |
| Champ de recherche | `[data-test="recherche"]` |
| Message « aucun résultat » | `[data-test="aucun-resultat"]` |
| Total du panier (prix formaté seul) | `[data-test="total"]` |

> [!NOTE]
> Un enfant ne modifie jamais une prop. La carte ne sait pas ce qu'est un panier : elle envoie juste l'id. C'est le catalogue qui décide quoi faire.

## Lancer les tests

Depuis le dossier `tp/vue` :

```bash
npm test -- 03-catalogue-produits
```

Pour voir le catalogue dans le navigateur : `npm run dev`.

## Critères de réussite

- La carte affiche le nom et le prix en euros (« 34,50 € »).
- Un clic sur « Ajouter au panier » émet `ajouter` avec l'id du produit.
- Si le stock est à 0, la carte affiche « Rupture de stock » et le bouton est désactivé.
- S'il reste du stock, pas de message de rupture et le bouton est actif.
- Le catalogue affiche un composant `ProduitCarte` par produit, avec la prop `produit`.
- La recherche filtre par nom, sans tenir compte des majuscules.
- Un message s'affiche quand aucun produit ne correspond.
- Le total du panier commence à « 0,00 € » et additionne les prix des produits ajoutés.

## Pour aller plus loin

- Affiche le nombre d'articles du panier à côté du total.
- Empêche d'ajouter plus d'articles que le stock disponible.
- Ajoute un tri par prix (croissant ou décroissant) avec un `<select>`.
