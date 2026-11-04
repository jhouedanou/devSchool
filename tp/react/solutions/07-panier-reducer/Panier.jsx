import { useReducer } from 'react';
import { calculerTotal, etatInitial, formaterPrix, panierReducer } from './panierReducer.js';

const PRODUITS = [
  { id: 'clavier', nom: 'Clavier', prix: 49.9 },
  { id: 'souris', nom: 'Souris', prix: 19.5 },
  { id: 'ecran', nom: 'Écran', prix: 189 },
];

export default function Panier({ produits = PRODUITS }) {
  const [etat, dispatch] = useReducer(panierReducer, etatInitial);
  const { articles } = etat;
  const total = calculerTotal(articles); // valeur dérivée

  return (
    <div className="panier">
      <section aria-labelledby="titre-catalogue">
        <h2 id="titre-catalogue">Catalogue</h2>
        <ul>
          {produits.map((produit) => (
            <li key={produit.id}>
              {produit.nom} ({formaterPrix(produit.prix)}){' '}
              <button
                type="button"
                aria-label={`Ajouter ${produit.nom}`}
                onClick={() => dispatch({ type: 'ajouter', produit })}
              >
                Ajouter
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titre-panier">
        <h2 id="titre-panier">Mon panier</h2>
        {articles.length === 0 ? (
          <p>Ton panier est vide.</p>
        ) : (
          <ul aria-label="Articles du panier">
            {articles.map((a) => (
              <li key={a.id}>
                <span className="nom">{a.nom}</span>
                <button
                  type="button"
                  aria-label={`Diminuer la quantité de ${a.nom}`}
                  onClick={() =>
                    dispatch({ type: 'changerQuantite', id: a.id, quantite: a.quantite - 1 })
                  }
                >
                  -
                </button>
                <span className="quantite">{a.quantite}</span>
                <button
                  type="button"
                  aria-label={`Augmenter la quantité de ${a.nom}`}
                  onClick={() =>
                    dispatch({ type: 'changerQuantite', id: a.id, quantite: a.quantite + 1 })
                  }
                >
                  +
                </button>
                <span className="sous-total">{formaterPrix(a.prix * a.quantite)}</span>
                <button
                  type="button"
                  aria-label={`Retirer ${a.nom}`}
                  onClick={() => dispatch({ type: 'retirer', id: a.id })}
                >
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="total">Total : {formaterPrix(total)}</p>
        <button
          type="button"
          onClick={() => dispatch({ type: 'vider' })}
          disabled={articles.length === 0}
        >
          Vider le panier
        </button>
      </section>
    </div>
  );
}
