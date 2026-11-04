import { useEffect, useState } from 'react';

export default function ListeUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [filtre, setFiltre] = useState('');
  // Changer ce nombre relance l'effet (bouton « Recharger »).
  const [version, setVersion] = useState(0);

  useEffect(() => {
    // Si le composant est démonté ou si une nouvelle requête part,
    // on ignore la réponse de l'ancienne.
    let ignorer = false;

    async function charger() {
      try {
        const reponse = await fetch('/api/utilisateurs');
        if (!reponse.ok) {
          throw new Error(`Erreur HTTP ${reponse.status}`);
        }
        const donnees = await reponse.json();
        if (!ignorer) setUtilisateurs(donnees);
      } catch (e) {
        if (!ignorer) setErreur(e.message);
      } finally {
        if (!ignorer) setChargement(false);
      }
    }

    charger();
    return () => {
      ignorer = true;
    };
  }, [version]);

  function recharger() {
    setChargement(true);
    setErreur(null);
    setVersion((v) => v + 1);
  }

  const recherche = filtre.trim().toLowerCase();
  const visibles = utilisateurs.filter((u) => u.nom.toLowerCase().includes(recherche));

  let contenu;
  if (chargement) {
    contenu = <p>Chargement en cours</p>;
  } else if (erreur) {
    contenu = <p role="alert">Impossible de charger les utilisateurs ({erreur}).</p>;
  } else if (visibles.length === 0) {
    contenu = <p>Aucun utilisateur ne correspond.</p>;
  } else {
    contenu = (
      <ul aria-label="Utilisateurs">
        {visibles.map((u) => (
          <li key={u.id}>{u.nom}</li>
        ))}
      </ul>
    );
  }

  return (
    <div className="utilisateurs">
      <div className="outils">
        <label>
          Filtrer par nom{' '}
          <input type="search" value={filtre} onChange={(e) => setFiltre(e.target.value)} />
        </label>
        <button type="button" onClick={recharger}>
          Recharger
        </button>
      </div>
      {contenu}
    </div>
  );
}
