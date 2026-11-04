export const etatInitial = { articles: [] };

// Reducer pur : il ne modifie jamais `etat`, il renvoie un nouvel objet.
export function panierReducer(etat, action) {
  switch (action.type) {
    case 'ajouter': {
      const { produit } = action;
      const existe = etat.articles.some((a) => a.id === produit.id);
      if (existe) {
        return {
          ...etat,
          articles: etat.articles.map((a) =>
            a.id === produit.id ? { ...a, quantite: a.quantite + 1 } : a,
          ),
        };
      }
      return { ...etat, articles: [...etat.articles, { ...produit, quantite: 1 }] };
    }

    case 'retirer':
      return { ...etat, articles: etat.articles.filter((a) => a.id !== action.id) };

    case 'changerQuantite': {
      // Une quantité de 0 (ou moins) retire l'article.
      if (action.quantite <= 0) {
        return { ...etat, articles: etat.articles.filter((a) => a.id !== action.id) };
      }
      return {
        ...etat,
        articles: etat.articles.map((a) =>
          a.id === action.id ? { ...a, quantite: action.quantite } : a,
        ),
      };
    }

    case 'vider':
      return { ...etat, articles: [] };

    default:
      throw new Error(`Action inconnue : ${action.type}`);
  }
}

export function calculerTotal(articles) {
  return articles.reduce((total, a) => total + a.prix * a.quantite, 0);
}

// 49.9 → "49,90 €"
export function formaterPrix(prix) {
  return `${prix.toFixed(2).replace('.', ',')} €`;
}
