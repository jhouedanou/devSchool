import { useLocalStorage } from './useLocalStorage.js';

export default function Preferences() {
  const [pseudo, setPseudo] = useLocalStorage('preferences.pseudo', '');
  const [compact, setCompact] = useLocalStorage('preferences.compact', false);

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
