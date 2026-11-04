import { useEffect, useState } from 'react';

export default function ListeUtilisateurs() {
  // Un utilisateur ressemble à : { id: 1, nom: 'Alice Martin', email: 'alice@exemple.fr' }
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [filtre, setFiltre] = useState('');
  // Astuce pour « Recharger » : un compteur qu'on met dans les dépendances de l'effet.
  const [version, setVersion] = useState(0);

  useEffect(() => {
    // TODO : charge les utilisateurs avec fetch('/api/utilisateurs').
    //   - si la réponse n'est pas OK (reponse.ok vaut false) :
    //     lève une erreur `Erreur HTTP ${reponse.status}` ;
    //   - sinon, lis le JSON et range-le dans `utilisateurs` ;
    //   - en cas d'erreur, range le message dans `erreur` ;
    //   - dans tous les cas, `chargement` passe à false à la fin.
    // TODO : ignore la réponse si le composant est démonté (variable `ignorer` + fonction de nettoyage).
  }, [version]);

  function recharger() {
    // TODO : remets `chargement` à true, `erreur` à null, puis augmente `version`.
  }

  // TODO : garde seulement les utilisateurs dont le nom contient le filtre
  //        (sans tenir compte des majuscules : toLowerCase()).
  const visibles = utilisateurs;

  // TODO : affiche le bon contenu selon l'état :
  //   chargement → <p>Chargement en cours</p>
  //   erreur     → <p role="alert">Impossible de charger les utilisateurs ({erreur}).</p>
  //   aucun nom  → <p>Aucun utilisateur ne correspond.</p>
  //   sinon      → la liste ci-dessous
  const contenu = (
    <ul aria-label="Utilisateurs">
      {visibles.map((u) => (
        <li key={u.id}>{u.nom}</li>
      ))}
    </ul>
  );

  return (
    <div className="utilisateurs">
      <div className="outils">
        <label>
          {/* TODO : rends ce champ contrôlé avec `filtre`. */}
          Filtrer par nom <input type="search" />
        </label>
        <button type="button" onClick={recharger}>
          Recharger
        </button>
      </div>
      {contenu}
    </div>
  );
}
