import ListeUtilisateurs from '@tp/04-liste-utilisateurs/ListeUtilisateurs.jsx';

// En mode dev, vite.config.js répond à GET /api/utilisateurs (avec un petit délai).
export default function Demo() {
  return <ListeUtilisateurs />;
}
