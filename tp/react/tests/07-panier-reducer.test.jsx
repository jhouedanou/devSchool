import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { etatInitial, panierReducer } from '@tp/07-panier-reducer/panierReducer.js';
import Panier from '@tp/07-panier-reducer/Panier.jsx';

const CLAVIER = { id: 'clavier', nom: 'Clavier', prix: 49.9 };
const SOURIS = { id: 'souris', nom: 'Souris', prix: 19.5 };

// Gèle un objet et tout ce qu'il contient : toute modification lèvera une erreur.
function geler(objet) {
  Object.values(objet).forEach((v) => {
    if (typeof v === 'object' && v !== null) geler(v);
  });
  return Object.freeze(objet);
}

const etatAvec = (...articles) => geler({ articles });

describe('07 · panierReducer (sans React)', () => {
  it("'ajouter' met un nouveau produit dans le panier avec la quantité 1", () => {
    const etat = panierReducer(etatInitial, { type: 'ajouter', produit: CLAVIER });

    expect(etat.articles).toEqual([{ ...CLAVIER, quantite: 1 }]);
  });

  it("'ajouter' un produit déjà présent augmente sa quantité, sans doublon", () => {
    const avant = etatAvec({ ...CLAVIER, quantite: 1 }, { ...SOURIS, quantite: 1 });

    const apres = panierReducer(avant, { type: 'ajouter', produit: CLAVIER });

    expect(apres.articles).toEqual([
      { ...CLAVIER, quantite: 2 },
      { ...SOURIS, quantite: 1 },
    ]);
  });

  it("ne modifie jamais l'état reçu et renvoie un nouvel objet", () => {
    const avant = etatAvec({ ...CLAVIER, quantite: 1 });
    const actions = [
      { type: 'ajouter', produit: CLAVIER },
      { type: 'ajouter', produit: SOURIS },
      { type: 'retirer', id: 'clavier' },
      { type: 'changerQuantite', id: 'clavier', quantite: 5 },
      { type: 'vider' },
    ];

    for (const action of actions) {
      // Si le reducer modifie `avant`, Object.freeze provoque une erreur ici.
      const apres = panierReducer(avant, action);
      expect(apres).not.toBe(avant);
    }
    expect(avant.articles).toEqual([{ ...CLAVIER, quantite: 1 }]);
  });

  it("'retirer' enlève l'article du panier", () => {
    const avant = etatAvec({ ...CLAVIER, quantite: 2 }, { ...SOURIS, quantite: 1 });

    const apres = panierReducer(avant, { type: 'retirer', id: 'clavier' });

    expect(apres.articles).toEqual([{ ...SOURIS, quantite: 1 }]);
  });

  it("'changerQuantite' change la quantité, et 0 retire l'article", () => {
    const avant = etatAvec({ ...CLAVIER, quantite: 1 }, { ...SOURIS, quantite: 1 });

    const trois = panierReducer(avant, { type: 'changerQuantite', id: 'clavier', quantite: 3 });
    expect(trois.articles).toEqual([
      { ...CLAVIER, quantite: 3 },
      { ...SOURIS, quantite: 1 },
    ]);

    const zero = panierReducer(avant, { type: 'changerQuantite', id: 'souris', quantite: 0 });
    expect(zero.articles).toEqual([{ ...CLAVIER, quantite: 1 }]);
  });

  it("'vider' vide le panier", () => {
    const avant = etatAvec({ ...CLAVIER, quantite: 2 });

    expect(panierReducer(avant, { type: 'vider' }).articles).toEqual([]);
  });

  it('lève une erreur pour une action inconnue', () => {
    expect(() => panierReducer(etatInitial, { type: 'payer' })).toThrow('Action inconnue : payer');
  });
});

describe('07 · Composant Panier', () => {
  const bouton = (nom) => screen.getByRole('button', { name: nom });
  const lignes = () =>
    within(screen.getByRole('list', { name: 'Articles du panier' })).getAllByRole('listitem');

  it('affiche un panier vide au départ', () => {
    render(<Panier />);

    expect(screen.getByText('Ton panier est vide.')).toBeInTheDocument();
    expect(screen.getByText('Total : 0,00 €')).toBeInTheDocument();
    expect(bouton('Vider le panier')).toBeDisabled();
  });

  it('ajoute des produits et calcule le total', async () => {
    const user = userEvent.setup();
    render(<Panier />);

    await user.click(bouton('Ajouter Clavier'));
    await user.click(bouton('Ajouter Clavier'));
    await user.click(bouton('Ajouter Souris'));

    expect(screen.queryByText('Ton panier est vide.')).not.toBeInTheDocument();
    expect(lignes()).toHaveLength(2);
    expect(lignes()[0]).toHaveTextContent('Clavier');
    expect(lignes()[0]).toHaveTextContent('99,80 €'); // 2 × 49,90 €
    expect(screen.getByText('Total : 119,30 €')).toBeInTheDocument();
  });

  it('change les quantités, retire un article et vide le panier', async () => {
    const user = userEvent.setup();
    render(<Panier />);
    await user.click(bouton('Ajouter Clavier'));
    await user.click(bouton('Ajouter Souris'));

    await user.click(bouton('Augmenter la quantité de Clavier'));
    expect(screen.getByText('Total : 119,30 €')).toBeInTheDocument();

    await user.click(bouton('Diminuer la quantité de Souris'));
    expect(lignes()).toHaveLength(1);
    expect(screen.getByText('Total : 99,80 €')).toBeInTheDocument();

    await user.click(bouton('Retirer Clavier'));
    expect(screen.getByText('Ton panier est vide.')).toBeInTheDocument();

    await user.click(bouton('Ajouter Souris'));
    await user.click(bouton('Vider le panier'));
    expect(screen.getByText('Ton panier est vide.')).toBeInTheDocument();
    expect(screen.getByText('Total : 0,00 €')).toBeInTheDocument();
  });
});
