import { describe, it, expect, vi } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@tp/05-theme-context/ThemeContext.jsx';
import BoutonTheme from '@tp/05-theme-context/BoutonTheme.jsx';
import Carte from '@tp/05-theme-context/Carte.jsx';

function Page(props) {
  return (
    <ThemeProvider {...props}>
      <BoutonTheme />
      <Carte titre="Première carte">Bonjour</Carte>
      <Carte titre="Deuxième carte">Salut</Carte>
    </ThemeProvider>
  );
}

const cartes = () => screen.getAllByRole('article');

describe('05 · Thème clair/sombre avec Context', () => {
  it('affiche les cartes en thème clair par défaut', () => {
    render(<Page />);

    for (const carte of cartes()) {
      expect(carte).toHaveClass('theme-clair');
      expect(carte).not.toHaveClass('theme-sombre');
    }
    expect(screen.getByRole('heading', { name: 'Première carte' })).toBeInTheDocument();
  });

  it('le bouton affiche « Passer en mode sombre » au départ', () => {
    render(<Page />);

    expect(screen.getByRole('button', { name: 'Passer en mode sombre' })).toBeInTheDocument();
  });

  it('un clic passe toutes les cartes en thème sombre et change le texte du bouton', async () => {
    const user = userEvent.setup();
    render(<Page />);

    await user.click(screen.getByRole('button', { name: 'Passer en mode sombre' }));

    for (const carte of cartes()) {
      expect(carte).toHaveClass('theme-sombre');
      expect(carte).not.toHaveClass('theme-clair');
    }
    expect(screen.getByRole('button', { name: 'Passer en mode clair' })).toBeInTheDocument();
  });

  it('un deuxième clic revient au thème clair', async () => {
    const user = userEvent.setup();
    render(<Page />);

    await user.click(screen.getByRole('button', { name: 'Passer en mode sombre' }));
    await user.click(screen.getByRole('button', { name: 'Passer en mode clair' }));

    expect(cartes()[0]).toHaveClass('theme-clair');
    expect(screen.getByRole('button', { name: 'Passer en mode sombre' })).toBeInTheDocument();
  });

  it('ThemeProvider accepte un thème de départ avec la prop themeInitial', () => {
    render(<Page themeInitial="sombre" />);

    expect(cartes()[0]).toHaveClass('theme-sombre');
    expect(screen.getByRole('button', { name: 'Passer en mode clair' })).toBeInTheDocument();
  });

  it('useTheme renvoie { theme, basculer } dans un ThemeProvider', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });

    expect(result.current.theme).toBe('clair');

    act(() => result.current.basculer());

    expect(result.current.theme).toBe('sombre');
  });

  it('useTheme lève une erreur claire hors d’un ThemeProvider', () => {
    // React affiche l'erreur dans la console : on la masque pour ce test.
    const espion = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useTheme())).toThrow(
      'useTheme doit être utilisé dans un ThemeProvider.',
    );

    espion.mockRestore();
  });
});
