import { describe, it, expect, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Inscription, { BoutonEnvoyer } from '@tp/08-actions-react19/Inscription.jsx';

// Crée une promesse qu'on résout nous-mêmes, au moment choisi.
function promesseControlee() {
  let resoudre;
  const promesse = new Promise((r) => {
    resoudre = r;
  });
  return { promesse, resoudre };
}

async function remplirEtEnvoyer(user) {
  await user.type(screen.getByLabelText('Pseudo'), 'lea');
  await user.type(screen.getByLabelText('Email'), 'lea@exemple.fr');
  await user.click(screen.getByRole('button', { name: "S'inscrire" }));
}

describe('08 · Formulaire avec useActionState (React 19)', () => {
  it('affiche les champs Pseudo et Email et le bouton « S’inscrire »', () => {
    render(<Inscription inscrire={vi.fn()} />);

    expect(screen.getByLabelText('Pseudo')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: "S'inscrire" })).toBeEnabled();
  });

  it('appelle inscrire une fois avec les données du formulaire (FormData)', async () => {
    const user = userEvent.setup();
    const inscrire = vi.fn(async () => ({ ok: true, message: 'Bienvenue lea !' }));
    render(<Inscription inscrire={inscrire} />);

    await remplirEtEnvoyer(user);
    await screen.findByRole('status');

    expect(inscrire).toHaveBeenCalledTimes(1);
    const formData = inscrire.mock.calls[0][0];
    expect(formData).toBeInstanceOf(FormData);
    expect(formData.get('pseudo')).toBe('lea');
    expect(formData.get('email')).toBe('lea@exemple.fr');
  });

  it('désactive le bouton pendant l’envoi, puis le réactive', async () => {
    const user = userEvent.setup();
    const { promesse, resoudre } = promesseControlee();
    render(<Inscription inscrire={() => promesse} />);

    await remplirEtEnvoyer(user);

    const boutonPendant = await screen.findByRole('button', { name: 'Envoi en cours' });
    expect(boutonPendant).toBeDisabled();

    await act(async () => resoudre({ ok: true, message: 'Bienvenue lea !' }));

    expect(await screen.findByRole('button', { name: "S'inscrire" })).toBeEnabled();
  });

  it('affiche le message de succès renvoyé par inscrire', async () => {
    const user = userEvent.setup();
    const inscrire = vi.fn(async () => ({ ok: true, message: 'Bienvenue lea !' }));
    render(<Inscription inscrire={inscrire} />);

    await remplirEtEnvoyer(user);

    expect(await screen.findByRole('status')).toHaveTextContent('Bienvenue lea !');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('affiche le message d’erreur renvoyé quand ok vaut false', async () => {
    const user = userEvent.setup();
    const inscrire = vi.fn(async () => ({ ok: false, message: 'Ce pseudo est déjà pris.' }));
    render(<Inscription inscrire={inscrire} />);

    await remplirEtEnvoyer(user);

    expect(await screen.findByRole('alert')).toHaveTextContent('Ce pseudo est déjà pris.');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('affiche un message générique si inscrire lève une erreur', async () => {
    const user = userEvent.setup();
    const inscrire = vi.fn(async () => {
      throw new Error('Serveur injoignable');
    });
    render(<Inscription inscrire={inscrire} />);

    await remplirEtEnvoyer(user);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Une erreur est survenue. Réessaie plus tard.',
    );
  });

  it('remplace l’ancien message à chaque nouvel envoi', async () => {
    const user = userEvent.setup();
    const inscrire = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, message: 'Ce pseudo est déjà pris.' })
      .mockResolvedValueOnce({ ok: true, message: 'Bienvenue lea !' });
    render(<Inscription inscrire={inscrire} />);

    await remplirEtEnvoyer(user);
    await screen.findByRole('alert');
    // Deuxième envoi : React a déjà vidé le formulaire, on clique simplement à nouveau.
    await user.click(screen.getByRole('button', { name: "S'inscrire" }));

    expect(await screen.findByRole('status')).toHaveTextContent('Bienvenue lea !');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('BoutonEnvoyer lit lui-même l’état du formulaire avec useFormStatus', async () => {
    const user = userEvent.setup();
    const { promesse, resoudre } = promesseControlee();
    // Un formulaire quelconque : BoutonEnvoyer ne reçoit aucune prop.
    render(
      <form action={() => promesse}>
        <BoutonEnvoyer />
      </form>,
    );

    await user.click(screen.getByRole('button', { name: "S'inscrire" }));

    expect(await screen.findByRole('button', { name: 'Envoi en cours' })).toBeDisabled();

    await act(async () => resoudre());
    expect(await screen.findByRole('button', { name: "S'inscrire" })).toBeEnabled();
  });
});
