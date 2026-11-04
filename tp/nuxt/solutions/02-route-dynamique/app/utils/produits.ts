export interface Produit {
  id: number
  nom: string
  prix: number
  description: string
}

export const produits: Produit[] = [
  { id: 1, nom: 'Clavier', prix: 49, description: 'Un clavier mécanique compact.' },
  { id: 2, nom: 'Souris', prix: 25, description: 'Une souris sans fil, légère et précise.' },
  { id: 3, nom: 'Écran', prix: 199, description: 'Un écran de 27 pouces pour travailler confortablement.' },
]

export function trouverProduit(id: number): Produit | undefined {
  return produits.find((produit) => produit.id === id)
}
