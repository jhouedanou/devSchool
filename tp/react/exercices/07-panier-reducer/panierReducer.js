// L'état du panier : { articles: [{ id, nom, prix, quantite }, …] }
export const etatInitial = { articles: [] };

// Règle d'or : ne modifie JAMAIS `etat`. Renvoie toujours un nouvel objet.
// Interdit : push, splice, article.quantite++…  Autorisé : map, filter, [...], {...}
export function panierReducer(etat, action) {
  switch (action.type) {
    case 'ajouter':
      // action = { type: 'ajouter', produit: { id, nom, prix } }
      // TODO : produit absent → ajoute-le avec quantite: 1.
      // TODO : produit déjà présent → augmente sa quantité de 1.
      return etat;

    case 'retirer':
      // action = { type: 'retirer', id }
      // TODO : retire l'article qui a cet id.
      return etat;

    case 'changerQuantite':
      // action = { type: 'changerQuantite', id, quantite }
      // TODO : remplace la quantité de l'article. Si quantite <= 0, retire l'article.
      return etat;

    case 'vider':
      // TODO : renvoie un panier sans articles.
      return etat;

    default:
      // TODO : lève une erreur `Action inconnue : ${action.type}`.
      return etat;
  }
}

// TODO : renvoie la somme de prix × quantite pour tous les articles (reduce).
export function calculerTotal(articles) {
  return 0;
}

// Déjà fait : 49.9 → "49,90 €"
export function formaterPrix(prix) {
  return `${prix.toFixed(2).replace('.', ',')} €`;
}
