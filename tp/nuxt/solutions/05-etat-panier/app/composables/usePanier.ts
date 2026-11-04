import type { Produit } from '~/utils/produits'

export interface LignePanier {
  id: number
  nom: string
  prix: number
  quantite: number
}

export function usePanier() {
  // La clé « panier » rend l'état commun à tous les composants qui appellent usePanier().
  const lignes = useState<LignePanier[]>('panier', () => [])

  function ajouter(produit: Produit) {
    const ligne = lignes.value.find((l) => l.id === produit.id)
    if (ligne) {
      ligne.quantite++
    }
    else {
      lignes.value.push({ id: produit.id, nom: produit.nom, prix: produit.prix, quantite: 1 })
    }
  }

  function retirer(id: number) {
    lignes.value = lignes.value.filter((l) => l.id !== id)
  }

  const nombre = computed(() => lignes.value.reduce((somme, l) => somme + l.quantite, 0))
  const total = computed(() => lignes.value.reduce((somme, l) => somme + l.prix * l.quantite, 0))

  return { lignes, ajouter, retirer, nombre, total }
}
