// TP 03 · API serveur de tâches
//
// Ces tests construisent l'application puis démarrent un vrai serveur Nuxt
// (environ 10 à 20 secondes au début). Ensuite, chaque test appelle ton API en HTTP.
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, fetch } from '@nuxt/test-utils/e2e'

interface Tache { id: number, titre: string, fait: boolean }

/** Appelle l'API et renvoie le code HTTP et le corps de la réponse (JSON si possible). */
async function appeler(methode: 'GET' | 'POST', chemin: string, corps?: unknown) {
  const reponse = await fetch(chemin, {
    method: methode,
    headers: { 'content-type': 'application/json', 'accept': 'application/json' },
    body: corps === undefined ? undefined : JSON.stringify(corps),
  })
  const texte = await reponse.text()
  let donnees: unknown = texte
  try {
    donnees = JSON.parse(texte)
  } catch {
    // La réponse n'est pas du JSON : on garde le texte.
  }
  return { statut: reponse.status, donnees }
}

const TACHES_DE_DEPART: Tache[] = [
  { id: 1, titre: 'Lire la documentation de Nuxt', fait: true },
  { id: 2, titre: 'Créer une route API', fait: false },
  { id: 3, titre: 'Afficher les tâches', fait: false },
]

describe('TP 03 · API serveur de tâches', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('..', import.meta.url)),
    server: true,
    build: true,
  })

  // Les tests GET passent avant les tests POST : les POST ajoutent des tâches en mémoire.
  it('GET /api/taches renvoie les 3 tâches de départ', async () => {
    const { statut, donnees } = await appeler('GET', '/api/taches')
    expect(statut, 'GET /api/taches doit répondre 200 (crée server/api/taches.get.ts)').toBe(200)
    expect(donnees).toEqual(TACHES_DE_DEPART)
  })

  it('GET /api/taches?fait=true renvoie seulement les tâches faites', async () => {
    const { statut, donnees } = await appeler('GET', '/api/taches?fait=true')
    expect(statut).toBe(200)
    expect(donnees).toEqual([TACHES_DE_DEPART[0]])
  })

  it('GET /api/taches?fait=false renvoie seulement les tâches à faire', async () => {
    const { statut, donnees } = await appeler('GET', '/api/taches?fait=false')
    expect(statut).toBe(200)
    expect(donnees).toEqual([TACHES_DE_DEPART[1], TACHES_DE_DEPART[2]])
  })

  it('GET /api/taches/2 renvoie la tâche 2', async () => {
    const { statut, donnees } = await appeler('GET', '/api/taches/2')
    expect(statut, 'GET /api/taches/2 doit répondre 200 (crée server/api/taches/[id].get.ts)').toBe(200)
    expect(donnees).toEqual(TACHES_DE_DEPART[1])
  })

  it('GET /api/taches/99 répond 404 avec le message « Tâche introuvable. »', async () => {
    const { statut, donnees } = await appeler('GET', '/api/taches/99')
    expect(statut).toBe(404)
    expect((donnees as { message?: string }).message).toBe('Tâche introuvable.')
  })

  it('POST /api/taches sans titre répond 400 « Le titre est obligatoire. »', async () => {
    const { statut, donnees } = await appeler('POST', '/api/taches', {})
    expect(statut, 'POST /api/taches doit valider le titre (crée server/api/taches.post.ts)').toBe(400)
    expect((donnees as { message?: string }).message).toBe('Le titre est obligatoire.')
  })

  it('POST /api/taches avec un titre trop court répond 400', async () => {
    const { statut, donnees } = await appeler('POST', '/api/taches', { titre: 'Ab' })
    expect(statut).toBe(400)
    expect((donnees as { message?: string }).message).toBe('Le titre doit faire au moins 3 caractères.')
  })

  it('POST /api/taches crée la tâche (201), lui donne un id et on peut la relire', async () => {
    const { statut, donnees } = await appeler('POST', '/api/taches', { titre: 'Écrire les tests' })
    expect(statut, 'la création doit répondre 201 (setResponseStatus)').toBe(201)
    const tache = donnees as Tache
    expect(tache).toEqual({ id: expect.any(Number), titre: 'Écrire les tests', fait: false })
    expect(TACHES_DE_DEPART.map((t) => t.id)).not.toContain(tache.id)

    const relue = await appeler('GET', `/api/taches/${tache.id}`)
    expect(relue.donnees).toEqual(tache)
    const liste = await appeler('GET', '/api/taches')
    expect(liste.donnees).toContainEqual(tache)
  })
})
