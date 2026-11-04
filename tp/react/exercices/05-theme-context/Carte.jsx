import { useTheme } from './ThemeContext.jsx';

export default function Carte({ titre, children }) {
  // TODO : lis le thème avec useTheme().

  // TODO : ajoute la classe `theme-clair` ou `theme-sombre` selon le thème.
  return (
    <article className="carte">
      <h2>{titre}</h2>
      {children}
    </article>
  );
}
