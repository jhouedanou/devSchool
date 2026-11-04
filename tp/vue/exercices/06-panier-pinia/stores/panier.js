import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

// Store « setup » : on l'écrit comme un composable.
//   ref()      → état
//   computed() → getters
//   fonction   → actions
export const usePanierStore = defineStore('panier', () => {
  // Chaque article : { id, nom, prix, quantite }
  const articles = ref([])

  // TODO 1 : getter « total » : somme de prix × quantite (reduce).
  const total = computed(() => 0)

  // TODO 2 : getter « nombreArticles » : somme des quantités.
  const nombreArticles = computed(() => 0)

  // TODO 3 : produit = { id, nom, prix }.
  //          S'il est déjà dans le panier, augmente seulement sa quantité.
  //          Sinon, ajoute { id, nom, prix, quantite: 1 }.
  function ajouter(produit) {}

  // TODO 4 : retire l'article qui a cet id.
  function retirer(id) {}

  // TODO 5 : vide le panier.
  function vider() {}

  // Tout ce qui est retourné fait partie du store.
  return { articles, total, nombreArticles, ajouter, retirer, vider }
})
