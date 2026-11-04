import { useTheme } from './ThemeContext.jsx';

export default function Carte({ titre, children }) {
  const { theme } = useTheme();

  return (
    <article className={`carte theme-${theme}`}>
      <h2>{titre}</h2>
      {children}
    </article>
  );
}
