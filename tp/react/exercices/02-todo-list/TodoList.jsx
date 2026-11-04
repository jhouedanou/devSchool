import { useState } from 'react';

const FILTRES = ['Toutes', 'Actives', 'Terminées'];

export default function TodoList() {
  // Une tâche ressemble à : { id: '…', texte: 'Lire', faite: false }
  const [taches, setTaches] = useState([]);
  const [texte, setTexte] = useState('');
  const [filtre, setFiltre] = useState('Toutes');

  function ajouter(event) {
    event.preventDefault(); // évite le rechargement de la page
    // TODO : retire les espaces autour du texte (trim).
    // TODO : si le texte est vide, ne fais rien.
    // TODO : ajoute la tâche avec un id unique : crypto.randomUUID().
    // TODO : vide le champ.
  }

  function basculer(id) {
    // TODO : inverse `faite` pour la tâche qui a cet id (crée un nouveau tableau avec map).
  }

  function supprimer(id) {
    // TODO : retire la tâche qui a cet id (filter).
  }

  // TODO : calcule la liste à afficher selon `filtre`
  // ('Toutes', 'Actives' = pas faites, 'Terminées' = faites).
  const tachesVisibles = taches;
  // TODO : calcule le nombre de tâches pas encore faites.
  const restantes = 0;

  return (
    <div className="todo">
      <form onSubmit={ajouter}>
        <label htmlFor="nouvelle-tache">Nouvelle tâche</label>
        {/* TODO : rends ce champ contrôlé (value + onChange). */}
        <input id="nouvelle-tache" />
        <button type="submit">Ajouter</button>
      </form>

      <div className="filtres">
        {FILTRES.map((nom) => (
          // TODO : au clic, change le filtre. aria-pressed vaut true pour le filtre actif.
          <button key={nom} type="button" aria-pressed={false}>
            {nom}
          </button>
        ))}
      </div>

      <ul aria-label="Tâches">
        {tachesVisibles.map((tache, index) => (
          // TODO : utilise une clé stable (l'id de la tâche), pas l'index.
          <li key={index}>
            <label>
              {/* TODO : coche la case selon `tache.faite` et appelle basculer au changement. */}
              <input type="checkbox" />
              {tache.texte}
            </label>
            {/* TODO : supprime la tâche au clic. */}
            <button type="button" aria-label={`Supprimer ${tache.texte}`}>
              Supprimer
            </button>
          </li>
        ))}
      </ul>

      {/* TODO : « 1 tâche restante » au singulier (0 ou 1), « 2 tâches restantes » au pluriel. */}
      <p>{restantes} tâches restantes</p>
    </div>
  );
}
