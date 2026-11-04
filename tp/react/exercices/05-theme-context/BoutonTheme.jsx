import { useTheme } from './ThemeContext.jsx';

export default function BoutonTheme() {
  const { theme, basculer } = useTheme();

  // TODO : au clic, appelle `basculer`.
  // TODO : le texte dépend du thème :
  //        'clair'  → « Passer en mode sombre »
  //        'sombre' → « Passer en mode clair »
  return <button type="button">Passer en mode sombre</button>;
}
