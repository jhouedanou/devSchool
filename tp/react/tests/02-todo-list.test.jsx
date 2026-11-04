import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TodoList from '@tp/02-todo-list/TodoList.jsx';

const champ = () => screen.getByLabelText('Nouvelle tâche');
const textesVisibles = () =>
  within(screen.getByRole('list', { name: 'Tâches' }))
    .queryAllByRole('listitem')
    .map((li) => li.textContent.replace('Supprimer', '').trim());

// Ajoute des tâches en les tapant puis en appuyant sur Entrée.
async function ajouterTaches(user, ...textes) {
  for (const texte of textes) {
    await user.type(champ(), `${texte}{Enter}`);
  }
}

describe('02 · Liste de tâches', () => {
  it('ajoute une tâche avec le bouton « Ajouter » et vide le champ', async () => {
    const user = userEvent.setup();
    render(<TodoList />);

    await user.type(champ(), 'Acheter du pain');
    await user.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(textesVisibles()).toEqual(['Acheter du pain']);
    expect(champ()).toHaveValue('');
  });

  it('ajoute une tâche avec la touche Entrée', async () => {
    const user = userEvent.setup();
    render(<TodoList />);

    await ajouterTaches(user, 'Lire', 'Courir');

    expect(textesVisibles()).toEqual(['Lire', 'Courir']);
  });

  it('ignore une tâche vide et retire les espaces autour du texte', async () => {
    const user = userEvent.setup();
    render(<TodoList />);

    await user.type(champ(), '   {Enter}');
    expect(textesVisibles()).toEqual([]);

    await user.type(champ(), '  Arroser les plantes  {Enter}');
    expect(textesVisibles()).toEqual(['Arroser les plantes']);
  });

  it('coche une tâche et met à jour le compteur de tâches restantes', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    await ajouterTaches(user, 'Lire', 'Courir');

    expect(screen.getByText('2 tâches restantes')).toBeInTheDocument();

    const caseLire = screen.getByRole('checkbox', { name: 'Lire' });
    await user.click(caseLire);

    expect(caseLire).toBeChecked();
    expect(screen.getByText('1 tâche restante')).toBeInTheDocument();
  });

  it('supprime une tâche', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    await ajouterTaches(user, 'Lire', 'Courir');

    await user.click(screen.getByRole('button', { name: 'Supprimer Lire' }));

    expect(textesVisibles()).toEqual(['Courir']);
    expect(screen.getByText('1 tâche restante')).toBeInTheDocument();
  });

  it('filtre les tâches : Toutes, Actives, Terminées', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    await ajouterTaches(user, 'Lire', 'Courir', 'Cuisiner');
    await user.click(screen.getByRole('checkbox', { name: 'Courir' }));

    await user.click(screen.getByRole('button', { name: 'Actives' }));
    expect(textesVisibles()).toEqual(['Lire', 'Cuisiner']);

    await user.click(screen.getByRole('button', { name: 'Terminées' }));
    expect(textesVisibles()).toEqual(['Courir']);

    await user.click(screen.getByRole('button', { name: 'Toutes' }));
    expect(textesVisibles()).toEqual(['Lire', 'Courir', 'Cuisiner']);
  });

  it('indique le filtre actif avec aria-pressed', async () => {
    const user = userEvent.setup();
    render(<TodoList />);

    expect(screen.getByRole('button', { name: 'Toutes' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Actives' })).toHaveAttribute('aria-pressed', 'false');

    await user.click(screen.getByRole('button', { name: 'Actives' }));

    expect(screen.getByRole('button', { name: 'Toutes' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Actives' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('utilise des clés stables : supprimer une tâche ne déplace pas les autres lignes', async () => {
    const user = userEvent.setup();
    render(<TodoList />);
    await ajouterTaches(user, 'Lire', 'Courir');

    // On garde une référence vers la ligne « Courir »…
    const ligneCourir = screen.getByRole('checkbox', { name: 'Courir' }).closest('li');
    await user.click(screen.getByRole('button', { name: 'Supprimer Lire' }));

    // … elle doit toujours exister et contenir « Courir ».
    // Avec key={index}, React réutilise la ligne pour une autre tâche.
    expect(ligneCourir).toBeInTheDocument();
    expect(ligneCourir).toHaveTextContent('Courir');
  });
});
