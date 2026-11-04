import { useState } from 'react';

export default function Compteur() {
  const [valeur, setValeur] = useState(0);
  // TODO : ajoute un état `historique` (un tableau, vide au départ).
  // Il contient les valeurs précédentes. La dernière case = la plus récente.
  const historique = [];

  // TODO : écris une fonction `changer(nouvelleValeur)` qui :
  //   1. ajoute la valeur actuelle à la fin de l'historique (sans modifier le tableau existant) ;
  //   2. remplace la valeur par `nouvelleValeur`.
  // Utilise-la pour les boutons -1, +1 et Remise à zéro.

  // TODO : écris une fonction `annuler()` qui :
  //   1. remet la dernière valeur de l'historique ;
  //   2. retire cette valeur de l'historique.

  return (
    <div className="compteur">
      <p className="valeur">Valeur : {valeur}</p>

      <div className="boutons">
        {/* TODO : branche les clics (onClick) sur tes fonctions. */}
        <button type="button">-1</button>
        <button type="button">+1</button>
        <button type="button">Remise à zéro</button>
        {/* TODO : désactive « Annuler » quand l'historique est vide. */}
        <button type="button">Annuler</button>
      </div>

      <h2>Historique</h2>
      <ul aria-label="Historique">
        {/* TODO : affiche chaque valeur de l'historique dans un <li> (avec une key). */}
      </ul>
    </div>
  );
}
