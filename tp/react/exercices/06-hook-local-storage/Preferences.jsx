import { useState } from 'react';
// import { useLocalStorage } from './useLocalStorage.js';

export default function Preferences() {
  // TODO : remplace useState par useLocalStorage, avec les clés
  //        'preferences.pseudo' et 'preferences.compact'.
  const [pseudo, setPseudo] = useState('');
  const [compact, setCompact] = useState(false);

  return (
    <form className={compact ? 'preferences compact' : 'preferences'}>
      <label>
        Pseudo <input value={pseudo} onChange={(e) => setPseudo(e.target.value)} />
      </label>
      <label>
        <input
          type="checkbox"
          checked={compact}
          onChange={(e) => setCompact(e.target.checked)}
        />{' '}
        Mode compact
      </label>
      <p>Bonjour {pseudo || 'inconnu'} !</p>
    </form>
  );
}
