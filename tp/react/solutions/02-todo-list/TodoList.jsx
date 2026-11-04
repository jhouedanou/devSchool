import { useState } from 'react';

const FILTRES = ['Toutes', 'Actives', 'Terminées'];

export default function TodoList() {
  const [taches, setTaches] = useState([]);
  const [texte, setTexte] = useState('');
  const [filtre, setFiltre] = useState('Toutes');

  function ajouter(event) {
    event.preventDefault();
    const propre = texte.trim();
    if (propre === '') return;
    // Un identifiant unique et stable sert de clé.
    setTaches([...taches, { id: crypto.randomUUID(), texte: propre, faite: false }]);
    setTexte('');
  }

  function basculer(id) {
    setTaches(taches.map((t) => (t.id === id ? { ...t, faite: !t.faite } : t)));
  }

  function supprimer(id) {
    setTaches(taches.filter((t) => t.id !== id));
  }

  // Valeurs dérivées : calculées à chaque rendu, pas stockées dans l'état.
  const tachesVisibles = taches.filter((t) => {
    if (filtre === 'Actives') return !t.faite;
    if (filtre === 'Terminées') return t.faite;
    return true;
  });
  const restantes = taches.filter((t) => !t.faite).length;

  return (
    <div className="todo">
      <form onSubmit={ajouter}>
        <label htmlFor="nouvelle-tache">Nouvelle tâche</label>
        <input
          id="nouvelle-tache"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
        />
        <button type="submit">Ajouter</button>
      </form>

      <div className="filtres">
        {FILTRES.map((nom) => (
          <button
            key={nom}
            type="button"
            aria-pressed={filtre === nom}
            onClick={() => setFiltre(nom)}
          >
            {nom}
          </button>
        ))}
      </div>

      <ul aria-label="Tâches">
        {tachesVisibles.map((tache) => (
          <li key={tache.id}>
            <label>
              <input
                type="checkbox"
                checked={tache.faite}
                onChange={() => basculer(tache.id)}
              />
              {tache.texte}
            </label>
            <button
              type="button"
              aria-label={`Supprimer ${tache.texte}`}
              onClick={() => supprimer(tache.id)}
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>

      <p>
        {restantes} {restantes > 1 ? 'tâches restantes' : 'tâche restante'}
      </p>
    </div>
  );
}
