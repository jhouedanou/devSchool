import { createContext, useContext, useState } from 'react';

// null par défaut : permet de savoir si on est hors du Provider.
const ThemeContext = createContext(null);

export function ThemeProvider({ children, themeInitial = 'clair' }) {
  const [theme, setTheme] = useState(themeInitial);

  function basculer() {
    setTheme((actuel) => (actuel === 'clair' ? 'sombre' : 'clair'));
  }

  // React 19 : <ThemeContext> sert directement de Provider.
  return <ThemeContext value={{ theme, basculer }}>{children}</ThemeContext>;
}

export function useTheme() {
  const valeur = useContext(ThemeContext);
  if (valeur === null) {
    throw new Error('useTheme doit être utilisé dans un ThemeProvider.');
  }
  return valeur;
}
