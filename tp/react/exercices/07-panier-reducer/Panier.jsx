// import { useReducer } from 'react';
import { calculerTotal, formaterPrix } from './panierReducer.js';

const PRODUITS = [
  { id: 'clavier', nom: 'Clavier', prix: 49.9 },
  { id: 'souris', nom: 'Souris', prix: 19.5 },
  { id: 'ecran', nom: 'Écran', prix: 189 },
];

export default function Panier({ produits = PRODUITS }) {
  // TODO : remplace ces deux lignes par useReducer(panierReducer, etatInitial).
  const articles = [];
  const dispatch = () => {};

  const total = calculerTotal(articles);

  return (
    <div className="panier">
      <section aria-labelledby="titre-catalogue">
        <h2 id="titre-catalogue">Catalogue</h2>
        <ul>
          {produits.map((produit) => (
            <li key={produit.id}>
              {produit.nom} ({formaterPrix(produit.prix)}){' '}
              {/* TODO : envoie l'action { type: 'ajouter', produit }. */}
              <button type="button" aria-label={`Ajouter ${produit.nom}`}>
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
                {/* TODO : changerQuantite avec a.quantite - 1 */}
                <button type="button" aria-label={`Diminuer la quantité de ${a.nom}`}>
                  -
                </button>
                <span className="quantite">{a.quantite}</span>
                {/* TODO : changerQuantite avec a.quantite + 1 */}
                <button type="button" aria-label={`Augmenter la quantité de ${a.nom}`}>
                  +
                </button>
                <span className="sous-total">{formaterPrix(a.prix * a.quantite)}</span>
                {/* TODO : retirer */}
                <button type="button" aria-label={`Retirer ${a.nom}`}>
                  Retirer
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="total">Total : {formaterPrix(total)}</p>
        {/* TODO : vider, et désactive le bouton quand le panier est vide. */}
        <button type="button">Vider le panier</button>
      </section>
    </div>
  );
}
