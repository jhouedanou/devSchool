import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ListeUtilisateurs from '@tp/04-liste-utilisateurs/ListeUtilisateurs.jsx';

const UTILISATEURS = [
  { id: 1, nom: 'Alice Martin', email: 'alice@exemple.fr' },
  { id: 2, nom: 'Bruno Petit', email: 'bruno@exemple.fr' },
  { id: 3, nom: 'Chloé Durand', email: 'chloe@exemple.fr' },
];

// Remplace fetch par une fausse fonction qui renvoie toujours la même réponse.
function simulerFetch(creerReponse) {
  const faux = vi.fn(async () => creerReponse());
  vi.stubGlobal('fetch', faux);
  return faux;
}

const nomsAffiches = () =>
  within(screen.getByRole('list', { name: 'Utilisateurs' }))
    .getAllByRole('listitem')
    .map((li) => li.textContent);

afterEach(() => {
  vi.unstubAllGlobals(); // remet le vrai fetch
});

describe('04 · Liste d’utilisateurs avec fetch', () => {
  it('affiche « Chargement en cours » puis la liste des utilisateurs', async () => {
    simulerFetch(() => Response.json(UTILISATEURS));
    render(<ListeUtilisateurs />);

    expect(screen.getByText('Chargement en cours')).toBeInTheDocument();

    expect(await screen.findByText('Alice Martin')).toBeInTheDocument();
    expect(nomsAffiches()).toEqual(['Alice Martin', 'Bruno Petit', 'Chloé Durand']);
    expect(screen.queryByText('Chargement en cours')).not.toBeInTheDocument();
  });

  it('appelle fetch une seule fois, sur /api/utilisateurs', async () => {
    const faux = simulerFetch(() => Response.json(UTILISATEURS));
    render(<ListeUtilisateurs />);

    await screen.findByText('Alice Martin');

    expect(faux).toHaveBeenCalledTimes(1);
    expect(faux.mock.calls[0][0]).toBe('/api/utilisateurs');
  });

  it("affiche une erreur si la réponse HTTP n'est pas OK", async () => {
    simulerFetch(() => new Response('Erreur serveur', { status: 500 }));
    render(<ListeUtilisateurs />);

    const alerte = await screen.findByRole('alert');

    expect(alerte).toHaveTextContent('Impossible de charger les utilisateurs');
    expect(alerte).toHaveTextContent('Erreur HTTP 500');
    expect(screen.queryByText('Chargement en cours')).not.toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Utilisateurs' })).not.toBeInTheDocument();
  });

  it('affiche une erreur si le réseau ne répond pas', async () => {
    simulerFetch(() => {
      throw new TypeError('Failed to fetch');
    });
    render(<ListeUtilisateurs />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Impossible de charger les utilisateurs',
    );
  });

  it('filtre la liste par nom, sans tenir compte des majuscules', async () => {
    const user = userEvent.setup();
    simulerFetch(() => Response.json(UTILISATEURS));
    render(<ListeUtilisateurs />);
    await screen.findByText('Alice Martin');

    await user.type(screen.getByLabelText('Filtrer par nom'), 'MAR');

    expect(nomsAffiches()).toEqual(['Alice Martin']);
  });

  it('affiche « Aucun utilisateur ne correspond. » si le filtre ne trouve rien', async () => {
    const user = userEvent.setup();
    simulerFetch(() => Response.json(UTILISATEURS));
    render(<ListeUtilisateurs />);
    await screen.findByText('Alice Martin');

    await user.type(screen.getByLabelText('Filtrer par nom'), 'zzz');

    expect(screen.getByText('Aucun utilisateur ne correspond.')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Utilisateurs' })).not.toBeInTheDocument();
  });

  it('« Recharger » relance la requête et affiche les nouvelles données', async () => {
    const user = userEvent.setup();
    const faux = vi
      .fn()
      .mockResolvedValueOnce(Response.json([UTILISATEURS[0]]))
      .mockResolvedValueOnce(Response.json([UTILISATEURS[0], { id: 9, nom: 'Zoé Bernard' }]));
    vi.stubGlobal('fetch', faux);
    render(<ListeUtilisateurs />);
    await screen.findByText('Alice Martin');

    await user.click(screen.getByRole('button', { name: 'Recharger' }));

    expect(await screen.findByText('Zoé Bernard')).toBeInTheDocument();
    expect(nomsAffiches()).toEqual(['Alice Martin', 'Zoé Bernard']);
    expect(faux).toHaveBeenCalledTimes(2);
  });
});
