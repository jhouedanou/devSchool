import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Compteur from '@tp/01-compteur/Compteur.jsx';

// Petits raccourcis pour lire l'écran.
const bouton = (nom) => screen.getByRole('button', { name: nom });
const valeursHistorique = () =>
  within(screen.getByRole('list', { name: 'Historique' }))
    .queryAllByRole('listitem')
    .map((li) => li.textContent);

describe('01 · Compteur avec historique', () => {
  it('affiche 0 au départ, sans historique, avec « Annuler » désactivé', () => {
    render(<Compteur />);

    expect(screen.getByText('Valeur : 0')).toBeInTheDocument();
    expect(valeursHistorique()).toEqual([]);
    expect(bouton('Annuler')).toBeDisabled();
  });

  it('« +1 » augmente la valeur', async () => {
    const user = userEvent.setup();
    render(<Compteur />);

    await user.click(bouton('+1'));
    await user.click(bouton('+1'));

    expect(screen.getByText('Valeur : 2')).toBeInTheDocument();
  });

  it('« -1 » diminue la valeur, même en dessous de zéro', async () => {
    const user = userEvent.setup();
    render(<Compteur />);

    await user.click(bouton('-1'));

    expect(screen.getByText('Valeur : -1')).toBeInTheDocument();
  });

  it('« Remise à zéro » remet la valeur à 0', async () => {
    const user = userEvent.setup();
    render(<Compteur />);

    await user.click(bouton('+1'));
    await user.click(bouton('+1'));
    await user.click(bouton('Remise à zéro'));

    expect(screen.getByText('Valeur : 0')).toBeInTheDocument();
  });

  it("l'historique liste les valeurs précédentes, dans l'ordre", async () => {
    const user = userEvent.setup();
    render(<Compteur />);

    await user.click(bouton('+1')); // 0 → 1
    await user.click(bouton('+1')); // 1 → 2
    await user.click(bouton('-1')); // 2 → 1

    expect(screen.getByText('Valeur : 1')).toBeInTheDocument();
    expect(valeursHistorique()).toEqual(['0', '1', '2']);
    expect(bouton('Annuler')).toBeEnabled();
  });

  it('« Annuler » revient à la valeur précédente et la retire de l’historique', async () => {
    const user = userEvent.setup();
    render(<Compteur />);

    await user.click(bouton('+1')); // 0 → 1
    await user.click(bouton('+1')); // 1 → 2
    await user.click(bouton('Annuler')); // retour à 1

    expect(screen.getByText('Valeur : 1')).toBeInTheDocument();
    expect(valeursHistorique()).toEqual(['0']);
  });

  it('« Annuler » se désactive quand il n’y a plus rien à annuler', async () => {
    const user = userEvent.setup();
    render(<Compteur />);

    await user.click(bouton('+1'));
    await user.click(bouton('Annuler'));

    expect(screen.getByText('Valeur : 0')).toBeInTheDocument();
    expect(valeursHistorique()).toEqual([]);
    expect(bouton('Annuler')).toBeDisabled();
  });

  it('« Annuler » après une remise à zéro retrouve la valeur d’avant', async () => {
    const user = userEvent.setup();
    render(<Compteur />);

    await user.click(bouton('+1'));
    await user.click(bouton('+1'));
    await user.click(bouton('Remise à zéro'));
    await user.click(bouton('Annuler'));

    expect(screen.getByText('Valeur : 2')).toBeInTheDocument();
  });
});
