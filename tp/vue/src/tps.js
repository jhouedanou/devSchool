// Liste des TP affichés dans la galerie.
// « @tp » pointe vers exercices/ (npm run dev) ou solutions/ (npm run dev:solutions).
import { defineAsyncComponent } from 'vue'
import ErreurChargement from './ErreurChargement.vue'
import { produits } from '@tp/03-catalogue-produits/produits.js'

// Chargement à la demande : une erreur dans un TP ne casse pas les autres.
const charger = (loader) => defineAsyncComponent({ loader, errorComponent: ErreurChargement })

export const tps = [
  {
    id: '01-compteur',
    titre: 'Compteur borné',
    niveau: 1,
    composant: charger(() => import('./demos/DemoCompteur.vue')),
  },
  {
    id: '02-todo-list',
    titre: 'Liste de tâches',
    niveau: 1,
    composant: charger(() => import('@tp/02-todo-list/TodoList.vue')),
  },
  {
    id: '03-catalogue-produits',
    titre: 'Catalogue : props et événements',
    niveau: 2,
    composant: charger(() => import('@tp/03-catalogue-produits/Catalogue.vue')),
    props: { produits },
  },
  {
    id: '04-formulaire-inscription',
    titre: "Formulaire d'inscription validé",
    niveau: 2,
    composant: charger(() => import('@tp/04-formulaire-inscription/Inscription.vue')),
    // La galerie écoute ces événements et les affiche sous le composant.
    evenements: ['inscrit'],
  },
  {
    id: '05-composable-fetch',
    titre: 'Composable useFetch',
    niveau: 2,
    composant: charger(() => import('@tp/05-composable-fetch/ListeUtilisateurs.vue')),
  },
  {
    id: '06-panier-pinia',
    titre: 'Panier avec Pinia',
    niveau: 3,
    composant: charger(() => import('./demos/DemoPanier.vue')),
  },
  {
    id: '07-mini-blog-router',
    titre: 'Mini-blog avec Vue Router',
    niveau: 3,
    composant: charger(() => import('./demos/DemoBlog.vue')),
  },
]
