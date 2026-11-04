import { useState } from 'react';

// Même API que useState : const [valeur, setValeur] = useLocalStorage('cle', valeurInitiale);
export function useLocalStorage(cle, valeurInitiale) {
  // TODO : au premier rendu seulement, lis localStorage.getItem(cle) :
  //   - rien de stocké (null)    → utilise valeurInitiale ;
  //   - du texte JSON            → JSON.parse(...) ;
  //   - du JSON invalide         → JSON.parse lève une erreur : attrape-la et utilise valeurInitiale.
  //   Astuce : useState(() => ...) n'appelle la fonction qu'une fois.
  //   Comme useState, valeurInitiale peut être une fonction : appelle-la dans ce cas.
  const [valeur, setValeur] = useState(valeurInitiale);

  // TODO : à chaque changement de `valeur`, écris JSON.stringify(valeur) dans localStorage
  //        (avec useEffect).

  return [valeur, setValeur];
}
