import { useTheme } from './ThemeContext.jsx';

export default function BoutonTheme() {
  const { theme, basculer } = useTheme();

  return (
    <button type="button" onClick={basculer}>
      {theme === 'clair' ? 'Passer en mode sombre' : 'Passer en mode clair'}
    </button>
  );
}
