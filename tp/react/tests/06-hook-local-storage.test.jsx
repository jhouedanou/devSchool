import { describe, it, expect, beforeEach } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocalStorage } from '@tp/06-hook-local-storage/useLocalStorage.js';
import Preferences from '@tp/06-hook-local-storage/Preferences.jsx';

beforeEach(() => {
  localStorage.clear(); // chaque test part d'un stockage vide
});

describe('06 · Hook useLocalStorage', () => {
  it('renvoie la valeur initiale quand rien n’est stocké', () => {
    const { result } = renderHook(() => useLocalStorage('compteur', 0));

    const [valeur, setValeur] = result.current;
    expect(valeur).toBe(0);
    expect(typeof setValeur).toBe('function');
  });

  it('lit la valeur déjà présente dans localStorage (en JSON)', () => {
    localStorage.setItem('reglages', JSON.stringify({ langue: 'fr', taille: 14 }));

    const { result } = renderHook(() => useLocalStorage('reglages', {}));

    expect(result.current[0]).toEqual({ langue: 'fr', taille: 14 });
  });

  it('écrit la nouvelle valeur en JSON dans localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('reglages', {}));

    act(() => result.current[1]({ langue: 'en' }));

    expect(result.current[0]).toEqual({ langue: 'en' });
    expect(localStorage.getItem('reglages')).toBe('{"langue":"en"}');
  });

  it('accepte une fonction de mise à jour, comme useState', () => {
    const { result } = renderHook(() => useLocalStorage('compteur', 0));

    act(() => {
      result.current[1]((v) => v + 1);
      result.current[1]((v) => v + 1);
    });

    expect(result.current[0]).toBe(2);
    expect(localStorage.getItem('compteur')).toBe('2');
  });

  it('accepte une fonction comme valeur initiale, comme useState', () => {
    const { result } = renderHook(() => useLocalStorage('liste', () => ['a', 'b']));

    expect(result.current[0]).toEqual(['a', 'b']);
  });

  it('garde la valeur initiale si le contenu stocké n’est pas du JSON valide', () => {
    localStorage.setItem('compteur', '{pas du json');

    const { result } = renderHook(() => useLocalStorage('compteur', 10));

    expect(result.current[0]).toBe(10);
  });

  it('Preferences retrouve le pseudo et le mode compact après un rechargement', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Preferences />);

    await user.type(screen.getByLabelText('Pseudo'), 'Léa');
    await user.click(screen.getByLabelText('Mode compact'));
    expect(screen.getByText('Bonjour Léa !')).toBeInTheDocument();

    // On démonte puis on remonte le composant, comme après un rechargement de page.
    unmount();
    render(<Preferences />);

    expect(screen.getByLabelText('Pseudo')).toHaveValue('Léa');
    expect(screen.getByLabelText('Mode compact')).toBeChecked();
    expect(localStorage.getItem('preferences.pseudo')).toBe('"Léa"');
  });
});
