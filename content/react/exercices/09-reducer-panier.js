export default {
  id: '09-reducer-panier',
  titre: 'Reducer de panier',
  type: 'js',
  consigne: `Écris le **reducer** d'un panier. C'est une fonction pure : pas de React ici, juste du JavaScript.

L'état a la forme \`{ articles: [{ id, nom, prix, quantite }] }\`.

1. \`{ type: 'ajouter', produit }\` : ajoute le produit avec \`quantite: 1\`. S'il est déjà dans le panier, augmente sa quantité de 1.
2. \`{ type: 'retirer', id }\` : diminue la quantité de 1. À 0, l'article disparaît.
3. \`{ type: 'vider' }\` : renvoie un panier vide.
4. Une action inconnue **lève une erreur** (\`throw new Error(…)\`).
5. Ne modifie **jamais** \`state\` : renvoie toujours un nouvel objet (\`...\`, \`map\`, \`filter\`).
6. Écris aussi \`calculerTotal(state)\` : la somme de \`prix × quantite\`.`,
  depart: `export const etatInitial = { articles: [] };

export function panierReducer(state, action) {
  switch (action.type) {
    case 'ajouter': {
      // TODO
      return state;
    }
    case 'retirer': {
      // TODO
      return state;
    }
    case 'vider':
      // TODO
      return state;
    default:
      // TODO : lever une erreur
      return state;
  }
}

export function calculerTotal(state) {
  // TODO
  return 0;
}
`,
  solution: `export const etatInitial = { articles: [] };

export function panierReducer(state, action) {
  switch (action.type) {
    case 'ajouter': {
      const existe = state.articles.some((a) => a.id === action.produit.id);
      if (existe) {
        return {
          ...state,
          articles: state.articles.map((a) =>
            a.id === action.produit.id ? { ...a, quantite: a.quantite + 1 } : a
          ),
        };
      }
      return { ...state, articles: [...state.articles, { ...action.produit, quantite: 1 }] };
    }
    case 'retirer': {
      return {
        ...state,
        articles: state.articles
          .map((a) => (a.id === action.id ? { ...a, quantite: a.quantite - 1 } : a))
          .filter((a) => a.quantite > 0),
      };
    }
    case 'vider':
      return { ...state, articles: [] };
    default:
      throw new Error(\`Action inconnue : \${action.type}\`);
  }
}

export function calculerTotal(state) {
  return state.articles.reduce((total, a) => total + a.prix * a.quantite, 0);
}
`,
  indices: [
    'Pour savoir si le produit existe : `state.articles.some((a) => a.id === action.produit.id)`.',
    'Pour « retirer » : `map` pour baisser la quantité, puis `filter` pour enlever les quantités à 0.',
    '`reduce((total, a) => total + a.prix * a.quantite, 0)` calcule le total.',
  ],
  tests: [
    {
      nom: '« ajouter » ajoute un nouveau produit avec quantite: 1',
      run: async (t) => {
        const { panierReducer, etatInitial } = t.module;
        const etat = panierReducer(etatInitial, { type: 'ajouter', produit: { id: 1, nom: 'Livre', prix: 12 } });
        t.expect(etat).toEqual({ articles: [{ id: 1, nom: 'Livre', prix: 12, quantite: 1 }] });
      },
    },
    {
      nom: '« ajouter » augmente la quantité d\'un produit déjà présent',
      aide: 'Si le produit existe, utilise `map` pour remplacer cet article par une copie avec `quantite + 1`.',
      run: async (t) => {
        const { panierReducer } = t.module;
        const depart = { articles: [{ id: 1, nom: 'Livre', prix: 12, quantite: 1 }, { id: 2, nom: 'Stylo', prix: 2, quantite: 3 }] };
        const etat = panierReducer(depart, { type: 'ajouter', produit: { id: 1, nom: 'Livre', prix: 12 } });
        t.expect(etat.articles).toHaveLength(2);
        t.expect(etat.articles[0].quantite).toBe(2);
        t.expect(etat.articles[1].quantite).toBe(3);
      },
    },
    {
      nom: '« retirer » diminue la quantité, puis supprime l\'article à 0',
      run: async (t) => {
        const { panierReducer } = t.module;
        let etat = { articles: [{ id: 1, nom: 'Livre', prix: 12, quantite: 2 }, { id: 2, nom: 'Stylo', prix: 2, quantite: 1 }] };
        etat = panierReducer(etat, { type: 'retirer', id: 1 });
        t.expect(etat.articles[0].quantite).toBe(1);
        etat = panierReducer(etat, { type: 'retirer', id: 2 });
        t.expect(etat.articles.map((a) => a.id)).toEqual([1]);
      },
    },
    {
      nom: '« vider » renvoie un panier vide',
      run: async (t) => {
        const { panierReducer } = t.module;
        const etat = panierReducer({ articles: [{ id: 1, nom: 'Livre', prix: 12, quantite: 2 }] }, { type: 'vider' });
        t.expect(etat.articles).toEqual([]);
      },
    },
    {
      nom: 'Ne modifie jamais l\'état reçu',
      aide: 'Pas de `push`, pas de `a.quantite++` : crée des copies avec `...`, `map` et `filter`.',
      run: async (t) => {
        const { panierReducer } = t.module;
        const geler = (o) => {
          Object.values(o).forEach((v) => { if (v && typeof v === 'object') geler(v); });
          return Object.freeze(o);
        };
        const depart = geler({ articles: [{ id: 1, nom: 'Livre', prix: 12, quantite: 1 }] });
        const a = panierReducer(depart, { type: 'ajouter', produit: { id: 2, nom: 'Stylo', prix: 2 } });
        const b = panierReducer(depart, { type: 'ajouter', produit: { id: 1, nom: 'Livre', prix: 12 } });
        const c = panierReducer(depart, { type: 'retirer', id: 1 });
        t.expect(a).not.toBe(depart);
        t.expect(b.articles[0].quantite).toBe(2);
        t.expect(c.articles).toHaveLength(0);
        t.expect(depart.articles[0].quantite).toBe(1);
      },
    },
    {
      nom: 'Une action inconnue lève une erreur',
      aide: 'Dans le `default` du `switch` : `throw new Error(…)`.',
      run: async (t) => {
        const { panierReducer, etatInitial } = t.module;
        t.expect(() => panierReducer(etatInitial, { type: 'ajoutr' })).toThrow();
      },
    },
    {
      nom: 'calculerTotal additionne prix × quantité',
      run: async (t) => {
        const { calculerTotal } = t.module;
        t.expect(calculerTotal({ articles: [] })).toBe(0);
        t.expect(calculerTotal({ articles: [{ id: 1, prix: 12, quantite: 2 }, { id: 2, prix: 2.5, quantite: 4 }] })).toBe(34);
      },
    },
  ],
};
