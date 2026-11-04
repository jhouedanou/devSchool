import { createContext, useContext } from 'react';

// null par défaut : on saura ainsi si un composant est utilisé hors du Provider.
const ThemeContext = createContext(null);

export function ThemeProvider({ children, themeInitial = 'clair' }) {
  // TODO : crée un état `theme` qui vaut `themeInitial` au départ ('clair' ou 'sombre').
  // TODO : écris une fonction `basculer()` qui passe de 'clair' à 'sombre' et inversement.
  // TODO : fournis { theme, basculer } à tous les enfants :
  //        <ThemeContext value={{ theme, basculer }}>{children}</ThemeContext>
  return children;
}

export function useTheme() {
  const valeur = useContext(ThemeContext);
  // TODO : si `valeur` vaut null (pas de Provider au-dessus), lève une erreur :
  //        'useTheme doit être utilisé dans un ThemeProvider.'
  // TODO : renvoie `valeur`.
  // En attendant, on renvoie une valeur fixe pour que la galerie s'affiche.
  return valeur ?? { theme: 'clair', basculer: () => {} };
}
