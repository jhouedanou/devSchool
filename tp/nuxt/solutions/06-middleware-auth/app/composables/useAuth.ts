export interface Utilisateur {
  nom: string
}

export function useAuth() {
  // null = personne n'est connecté. La clé « utilisateur » partage l'état dans toute l'application.
  const utilisateur = useState<Utilisateur | null>('utilisateur', () => null)

  const estConnecte = computed(() => utilisateur.value !== null)

  function connecter(nom: string) {
    utilisateur.value = { nom }
  }

  function deconnecter() {
    utilisateur.value = null
  }

  return { utilisateur, estConnecte, connecter, deconnecter }
}
