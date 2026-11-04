import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

// Store « setup » : on l'écrit comme un composable.
//   ref()      → état
//   computed() → getters
//   fonction   → actions
export const usePanierStore = defineStore('panier', () => {
  // Chaque article : { id, nom, prix, quantite }
  const articles = ref([])

  const total = computed(() =>
    articles.value.reduce((somme, article) => somme + article.prix * article.quantite, 0),
  )

  const nombreArticles = computed(() =>
    articles.value.reduce((somme, article) => somme + article.quantite, 0),
  )

  // produit : { id, nom, prix }
  function ajouter(produit) {
    const existant = articles.value.find((article) => article.id === produit.id)
    if (existant) {
      existant.quantite++
    } else {
      articles.value.push({ id: produit.id, nom: produit.nom, prix: produit.prix, quantite: 1 })
    }
  }

  function retirer(id) {
    articles.value = articles.value.filter((article) => article.id !== id)
  }

  function vider() {
    articles.value = []
  }

  // Tout ce qui est retourné fait partie du store.
  return { articles, total, nombreArticles, ajouter, retirer, vider }
})
