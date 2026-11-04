import { createRouter, createWebHashHistory } from 'vue-router'
import Accueil from './pages/Accueil.vue'
// TODO 1 : importe aussi les pages Article et PageIntrouvable (dossier pages/).

export const routes = [
  { path: '/', name: 'accueil', component: Accueil },
  // TODO 2 : route « article » : /articles/:id → page Article.
  // TODO 3 : route « introuvable » qui attrape toutes les autres adresses
  //          (chemin '/:pathMatch(.*)*') → page PageIntrouvable. Toujours en dernier.
]

// La galerie utilise l'historique « hash » (adresses en #/articles/1).
// Les tests créent leur propre routeur avec createMemoryHistory().
export function creerRouteur(history = createWebHashHistory()) {
  return createRouter({ history, routes })
}
