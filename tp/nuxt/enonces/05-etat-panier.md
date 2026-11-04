# État partagé avec useState

## Objectif

Ajouter un panier à la boutique du TP 02. Un bouton ajoute un produit, et un résumé dans l'en-tête affiche le nombre d'articles et le total.
Les deux composants ne se connaissent pas : ils partagent le même état grâce à `useState`.

## Ce que tu vas pratiquer

- un composable dans `app/composables/` ;
- `useState()` avec une clé pour partager un état ;
- des valeurs calculées avec `computed()` ;
- des composants auto-importés depuis `app/components/`.

Revois si besoin [la leçon sur l'état](#/nuxt/lecon/05-etat) et [la leçon sur les composants et les auto-imports](#/nuxt/lecon/03-composants-auto-imports).

## Fichiers à créer ou modifier

- `app/composables/usePanier.ts`
- `app/components/BoutonAjouter.vue`
- `app/components/ResumePanier.vue`
- `app/layouts/default.vue` (à modifier)
- `app/pages/produits/[id].vue` (à modifier)

## Étapes

1. Crée `app/composables/usePanier.ts` et exporte la fonction `usePanier()`.
2. Dans `usePanier()`, crée l'état : `const lignes = useState<LignePanier[]>('panier', () => [])`. Une ligne a la forme `{ id, nom, prix, quantite }`.
3. Écris `ajouter(produit: Produit)` (type importé avec `import type { Produit } from '~/utils/produits'`) :
   - si le produit est déjà dans le panier, augmente sa `quantite` de 1 ;
   - sinon, ajoute une ligne avec `quantite: 1`.
4. Écris `retirer(id)` : elle enlève toute la ligne de ce produit.
5. Ajoute deux `computed` : `nombre` (somme des quantités) et `total` (somme de `prix × quantite`).
6. Renvoie `{ lignes, ajouter, retirer, nombre, total }`.
7. Crée `app/components/BoutonAjouter.vue`. Il reçoit la prop `produit` et affiche `<button data-test="bouton-ajouter">Ajouter au panier</button>`. Au clic, il appelle `ajouter(produit)`.
8. Crée `app/components/ResumePanier.vue`. Il affiche `<p data-test="resume-panier">` avec :
   - « Panier vide » si `nombre` vaut 0 ;
   - sinon : `<span data-test="panier-nombre">3</span>` article(s) et `<span data-test="panier-total">123 €</span>`.
9. Ajoute `<ResumePanier />` dans le `<header>` du layout, après le `<nav>`.
10. Ajoute `<BoutonAjouter :produit="produit" />` sur la fiche produit `app/pages/produits/[id].vue`.
11. Lance `npm run dev`, ajoute des produits et change de page : le résumé garde les bonnes valeurs.

> [!WARNING]
> Ne crée pas l'état avec `ref([])` en dehors de la fonction. Côté serveur, cet état serait partagé entre tous les visiteurs. `useState` crée un état par requête et le transmet au navigateur.

## Lancer les tests

Depuis le dossier `tp/nuxt` :

```bash
npm test -- 05-etat-panier
```

## Critères de réussite

- `usePanier()` démarre avec un panier vide : `lignes` vaut `[]`, `nombre` et `total` valent 0.
- `ajouter()` deux fois le même produit donne une seule ligne avec `quantite: 2`.
- `total` vaut 123 pour 2 claviers (49 €) et 1 souris (25 €).
- `retirer(id)` enlève la ligne du produit.
- Deux appels à `usePanier()` partagent les mêmes données.
- `ResumePanier` affiche « Panier vide » quand le panier est vide.
- Un clic sur `BoutonAjouter` met à jour `ResumePanier` (`[data-test="panier-nombre"]` et `[data-test="panier-total"]`).
- La fiche produit contient le bouton, et le `<header>` du layout contient le résumé.

## Pour aller plus loin

- Crée une page `/panier` qui liste les lignes, avec un bouton « Retirer » sur chacune.
- Ajoute une fonction `vider()` au composable.
- Ajoute `diminuer(id)` : elle enlève une seule unité, et la ligne disparaît à 0.
