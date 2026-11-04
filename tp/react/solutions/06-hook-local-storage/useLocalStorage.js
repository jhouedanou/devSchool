import { useEffect, useState } from 'react';

// Lit et décode la valeur stockée. Renvoie la valeur initiale si rien n'est stocké
// ou si le contenu n'est pas du JSON valide.
function lire(cle, valeurInitiale) {
  const parDefaut = typeof valeurInitiale === 'function' ? valeurInitiale() : valeurInitiale;
  try {
    const brut = localStorage.getItem(cle);
    return brut === null ? parDefaut : JSON.parse(brut);
  } catch {
    return parDefaut;
  }
}

export function useLocalStorage(cle, valeurInitiale) {
  // Fonction d'initialisation : localStorage n'est lu qu'au premier rendu.
  const [valeur, setValeur] = useState(() => lire(cle, valeurInitiale));

  // Écrit dans localStorage à chaque changement de valeur.
  useEffect(() => {
    try {
      localStorage.setItem(cle, JSON.stringify(valeur));
    } catch {
      // Stockage plein ou interdit (navigation privée) : on garde l'état en mémoire.
    }
  }, [cle, valeur]);

  // setValeur vient de useState : il accepte une valeur ou une fonction (v) => …
  return [valeur, setValeur];
}
