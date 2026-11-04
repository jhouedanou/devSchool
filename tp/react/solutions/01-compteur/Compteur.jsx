import { useState } from 'react';

export default function Compteur() {
  const [valeur, setValeur] = useState(0);
  // Pile des valeurs précédentes : la dernière entrée est la plus récente.
  const [historique, setHistorique] = useState([]);

  function changer(nouvelleValeur) {
    setHistorique([...historique, valeur]);
    setValeur(nouvelleValeur);
  }

  function annuler() {
    if (historique.length === 0) return;
    setValeur(historique[historique.length - 1]);
    setHistorique(historique.slice(0, -1));
  }

  return (
    <div className="compteur">
      <p className="valeur">Valeur : {valeur}</p>

      <div className="boutons">
        <button type="button" onClick={() => changer(valeur - 1)}>
          -1
        </button>
        <button type="button" onClick={() => changer(valeur + 1)}>
          +1
        </button>
        <button type="button" onClick={() => changer(0)}>
          Remise à zéro
        </button>
        <button type="button" onClick={annuler} disabled={historique.length === 0}>
          Annuler
        </button>
      </div>

      <h2>Historique</h2>
      <ul aria-label="Historique">
        {historique.map((ancienneValeur, index) => (
          // L'index suffit ici : la liste ne change qu'à la fin.
          <li key={index}>{ancienneValeur}</li>
        ))}
      </ul>
    </div>
  );
}
