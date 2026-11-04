import { ThemeProvider } from '@tp/05-theme-context/ThemeContext.jsx';
import BoutonTheme from '@tp/05-theme-context/BoutonTheme.jsx';
import Carte from '@tp/05-theme-context/Carte.jsx';

export default function Demo() {
  return (
    <ThemeProvider>
      <BoutonTheme />
      <div className="cartes">
        <Carte titre="Première carte">Le thème vient du Context.</Carte>
        <Carte titre="Deuxième carte">Aucune prop à faire descendre.</Carte>
      </div>
    </ThemeProvider>
  );
}
