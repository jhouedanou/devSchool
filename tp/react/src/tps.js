import { lazy } from 'react';

// Liste des TP affichés dans la galerie.
// Chaque démo importe ses composants depuis '@tp/…' :
// ./exercices avec `npm run dev`, ./solutions avec `npm run dev:solution`.
export const TPS = [
  {
    id: '01-compteur',
    titre: 'Compteur avec historique',
    niveau: 1,
    Demo: lazy(() => import('./demos/01-compteur.jsx')),
  },
  {
    id: '02-todo-list',
    titre: 'Liste de tâches',
    niveau: 1,
    Demo: lazy(() => import('./demos/02-todo-list.jsx')),
  },
  {
    id: '03-formulaire-contact',
    titre: 'Formulaire de contact validé',
    niveau: 2,
    Demo: lazy(() => import('./demos/03-formulaire-contact.jsx')),
  },
  {
    id: '04-liste-utilisateurs',
    titre: "Liste d'utilisateurs avec fetch",
    niveau: 2,
    Demo: lazy(() => import('./demos/04-liste-utilisateurs.jsx')),
  },
  {
    id: '05-theme-context',
    titre: 'Thème clair/sombre avec Context',
    niveau: 2,
    Demo: lazy(() => import('./demos/05-theme-context.jsx')),
  },
  {
    id: '06-hook-local-storage',
    titre: 'Hook useLocalStorage',
    niveau: 2,
    Demo: lazy(() => import('./demos/06-hook-local-storage.jsx')),
  },
  {
    id: '07-panier-reducer',
    titre: 'Panier avec useReducer',
    niveau: 3,
    Demo: lazy(() => import('./demos/07-panier-reducer.jsx')),
  },
  {
    id: '08-actions-react19',
    titre: 'Formulaire avec useActionState (React 19)',
    niveau: 3,
    Demo: lazy(() => import('./demos/08-actions-react19.jsx')),
  },
];
