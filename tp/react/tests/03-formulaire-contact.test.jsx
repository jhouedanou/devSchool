import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormulaireContact from '@tp/03-formulaire-contact/FormulaireContact.jsx';

const ERREUR_NOM = 'Le nom est obligatoire.';
const ERREUR_EMAIL = "L'adresse email n'est pas valide.";
const ERREUR_SUJET = 'Choisis un sujet.';
const ERREUR_MESSAGE = 'Le message doit contenir au moins 20 caractères.';
const CONFIRMATION = 'Merci, ton message a bien été envoyé.';

const champs = () => ({
  nom: screen.getByLabelText('Nom'),
  email: screen.getByLabelText('Email'),
  sujet: screen.getByLabelText('Sujet'),
  message: screen.getByLabelText('Message'),
});
const envoyer = (user) => user.click(screen.getByRole('button', { name: 'Envoyer' }));

async function remplir(user, { nom, email, sujet, message }) {
  const c = champs();
  if (nom) await user.type(c.nom, nom);
  if (email) await user.type(c.email, email);
  if (sujet) await user.selectOptions(c.sujet, sujet);
  if (message) await user.type(c.message, message);
}

const VALIDE = {
  nom: 'Léa Dupont',
  email: 'lea@exemple.fr',
  sujet: 'question',
  message: 'Bonjour, j’ai une question sur vos cours.',
};

describe('03 · Formulaire de contact validé', () => {
  it('affiche ce que je saisis dans chaque champ', async () => {
    const user = userEvent.setup();
    render(<FormulaireContact onEnvoyer={vi.fn()} />);

    await remplir(user, VALIDE);

    const c = champs();
    expect(c.nom).toHaveValue('Léa Dupont');
    expect(c.email).toHaveValue('lea@exemple.fr');
    expect(c.sujet).toHaveValue('question');
    expect(c.message).toHaveValue(VALIDE.message);
  });

  it("n'affiche aucune erreur avant la première tentative d'envoi", async () => {
    const user = userEvent.setup();
    render(<FormulaireContact onEnvoyer={vi.fn()} />);

    await user.type(champs().email, 'pas-un-email');

    expect(screen.queryByText(ERREUR_NOM)).not.toBeInTheDocument();
    expect(screen.queryByText(ERREUR_EMAIL)).not.toBeInTheDocument();
  });

  it("affiche toutes les erreurs si j'envoie le formulaire vide, sans appeler onEnvoyer", async () => {
    const user = userEvent.setup();
    const onEnvoyer = vi.fn();
    render(<FormulaireContact onEnvoyer={onEnvoyer} />);

    await envoyer(user);

    expect(screen.getByText(ERREUR_NOM)).toBeInTheDocument();
    expect(screen.getByText(ERREUR_EMAIL)).toBeInTheDocument();
    expect(screen.getByText(ERREUR_SUJET)).toBeInTheDocument();
    expect(screen.getByText(ERREUR_MESSAGE)).toBeInTheDocument();
    expect(onEnvoyer).not.toHaveBeenCalled();
  });

  it('refuse un email invalide et un message de moins de 20 caractères', async () => {
    const user = userEvent.setup();
    const onEnvoyer = vi.fn();
    render(<FormulaireContact onEnvoyer={onEnvoyer} />);

    await remplir(user, { ...VALIDE, email: 'lea@exemple', message: 'Dix-neuf caractères' });
    await envoyer(user);

    expect(screen.queryByText(ERREUR_NOM)).not.toBeInTheDocument();
    expect(screen.queryByText(ERREUR_SUJET)).not.toBeInTheDocument();
    expect(screen.getByText(ERREUR_EMAIL)).toBeInTheDocument();
    expect(screen.getByText(ERREUR_MESSAGE)).toBeInTheDocument();
    expect(onEnvoyer).not.toHaveBeenCalled();
  });

  it("fait disparaître l'erreur d'un champ dès qu'il est corrigé", async () => {
    const user = userEvent.setup();
    render(<FormulaireContact onEnvoyer={vi.fn()} />);

    await envoyer(user);
    expect(screen.getByText(ERREUR_NOM)).toBeInTheDocument();

    await user.type(champs().nom, 'Léa');

    expect(screen.queryByText(ERREUR_NOM)).not.toBeInTheDocument();
    expect(screen.getByText(ERREUR_EMAIL)).toBeInTheDocument();
  });

  it('appelle onEnvoyer une fois avec les données, sans espaces autour', async () => {
    const user = userEvent.setup();
    const onEnvoyer = vi.fn();
    render(<FormulaireContact onEnvoyer={onEnvoyer} />);

    await remplir(user, { ...VALIDE, nom: '  Léa Dupont  ', message: `  ${VALIDE.message}  ` });
    await envoyer(user);

    expect(onEnvoyer).toHaveBeenCalledTimes(1);
    expect(onEnvoyer).toHaveBeenCalledWith({
      nom: 'Léa Dupont',
      email: 'lea@exemple.fr',
      sujet: 'question',
      message: VALIDE.message,
    });
  });

  it("affiche une confirmation et vide le formulaire après l'envoi", async () => {
    const user = userEvent.setup();
    render(<FormulaireContact onEnvoyer={vi.fn()} />);

    await remplir(user, VALIDE);
    await envoyer(user);

    expect(screen.getByText(CONFIRMATION)).toBeInTheDocument();
    const c = champs();
    expect(c.nom).toHaveValue('');
    expect(c.email).toHaveValue('');
    expect(c.sujet).toHaveValue('');
    expect(c.message).toHaveValue('');
    // Le formulaire est vide, mais aucune erreur ne s'affiche.
    expect(screen.queryByText(ERREUR_NOM)).not.toBeInTheDocument();
  });
});
