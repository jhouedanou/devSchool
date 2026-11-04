import { createRouter, createWebHashHistory } from 'vue-router'
import Accueil from './pages/Accueil.vue'
import Article from './pages/Article.vue'
import PageIntrouvable from './pages/PageIntrouvable.vue'

export const routes = [
  { path: '/', name: 'accueil', component: Accueil },
  // « :id » est un paramètre : /articles/1, /articles/2…
  { path: '/articles/:id', name: 'article', component: Article },
  // Attrape-tout : toutes les autres adresses. Toujours en dernier.
  { path: '/:pathMatch(.*)*', name: 'introuvable', component: PageIntrouvable },
]

// La galerie utilise l'historique « hash » (adresses en #/articles/1).
// Les tests créent leur propre routeur avec createMemoryHistory().
export function creerRouteur(history = createWebHashHistory()) {
  return createRouter({ history, routes })
}
