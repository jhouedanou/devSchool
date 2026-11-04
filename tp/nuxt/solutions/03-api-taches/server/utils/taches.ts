// Stockage des tâches en mémoire : les données repartent de zéro à chaque démarrage du serveur.
export interface Tache {
  id: number
  titre: string
  fait: boolean
}

const taches: Tache[] = [
  { id: 1, titre: 'Lire la documentation de Nuxt', fait: true },
  { id: 2, titre: 'Créer une route API', fait: false },
  { id: 3, titre: 'Afficher les tâches', fait: false },
]

let prochainId = 4

export function listerTaches(fait?: boolean): Tache[] {
  if (fait === undefined) {
    return taches
  }
  return taches.filter((tache) => tache.fait === fait)
}

export function trouverTache(id: number): Tache | undefined {
  return taches.find((tache) => tache.id === id)
}

export function ajouterTache(titre: string): Tache {
  const tache: Tache = { id: prochainId++, titre, fait: false }
  taches.push(tache)
  return tache
}
