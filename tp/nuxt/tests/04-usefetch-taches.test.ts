// TP 04 · Afficher les tâches avec useFetch
//
// Ici, la vraie API n'est pas lancée : registerEndpoint() crée une fausse route /api/taches
// pour chaque test. Tu contrôles ainsi ce que « le serveur » répond.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mountSuspended, registerEndpoint } from '@nuxt/test-utils/runtime'
import type { VueWrapper } from '@vue/test-utils'
import { clearNuxtData, createError, refreshNuxtData } from '#imports'
import { chargerComposant } from './outils'

interface Tache { id: number, titre: string, fait: boolean }
type Gestionnaire = Parameters<typeof registerEndpoint>[1]
type Evenement = { path: string, web?: { request?: Request } }

const TACHES: Tache[] = [
  { id: 1, titre: 'Lire la documentation de Nuxt', fait: true },
  { id: 2, titre: 'Créer une route API', fait: false },
  { id: 3, titre: 'Afficher les tâches', fait: false },
]

// Fausses routes enregistrées pendant un test : on les retire à la fin du test.
const aRetirer: Array<() => void> = []
function fausseRoute(methode: 'GET' | 'POST', handler: (evenement: Evenement) => unknown) {
  aRetirer.push(registerEndpoint('/api/taches', { method: methode, handler } as Gestionnaire))
}

/** Lit le paramètre « fait » de l'URL appelée (null s'il est absent). */
function parametreFait(evenement: Evenement) {
  return new URL(evenement.path, 'http://localhost').searchParams.get('fait')
}

/** Lit le corps JSON envoyé par la page. */
async function corpsJson(evenement: Evenement) {
  return (await evenement.web?.request?.json()) as { titre?: string }
}

const chargerPage = () => chargerComposant('app/pages/taches.vue')
const titresAffiches = (page: VueWrapper) =>
  page.findAll('[data-test="tache"]').map((li) => li.text())

beforeEach(() => {
  clearNuxtData()
})

afterEach(() => {
  aRetirer.splice(0).forEach((retirer) => retirer())
})

describe('TP 04 · Afficher les tâches avec useFetch', () => {
  it('affiche les tâches renvoyées par /api/taches', async () => {
    fausseRoute('GET', () => TACHES)
    const page = await mountSuspended(await chargerPage(), { route: '/taches' })
    expect(page.find('h1').text()).toBe('Tâches')
    const titres = titresAffiches(page)
    expect(titres).toHaveLength(3)
    expect(titres[0]).toContain('Lire la documentation de Nuxt')
    expect(titres[2]).toContain('Afficher les tâches')
  })

  it('affiche « Chargement… » pendant le chargement', async () => {
    let bloquer = false
    let debloquer = () => {}
    fausseRoute('GET', async () => {
      if (bloquer) await new Promise<void>((resolve) => { debloquer = resolve })
      return TACHES
    })
    const page = await mountSuspended(await chargerPage(), { route: '/taches' })

    bloquer = true
    const rechargement = refreshNuxtData()
    await vi.waitFor(() => {
      expect(page.find('[data-test="chargement"]').exists(), 'affiche data-test="chargement" quand status vaut « pending »').toBe(true)
    })
    expect(page.find('[data-test="chargement"]').text()).toBe('Chargement…')

    debloquer()
    await rechargement
    await vi.waitFor(() => expect(page.find('[data-test="chargement"]').exists()).toBe(false))
    expect(titresAffiches(page)).toHaveLength(3)
  })

  it('affiche un message d\'erreur si l\'API répond une erreur', async () => {
    fausseRoute('GET', () => {
      throw createError({ status: 500, statusText: 'Erreur serveur' })
    })
    const page = await mountSuspended(await chargerPage(), { route: '/taches' })
    expect(page.find('[data-test="erreur"]').exists(), 'il manque data-test="erreur"').toBe(true)
    expect(page.find('[data-test="erreur"]').text()).toBe('Impossible de charger les tâches.')
    expect(titresAffiches(page)).toHaveLength(0)
  })

  it('le filtre envoie ?fait=true ou ?fait=false et affiche les tâches filtrées', async () => {
    const recus: Array<string | null> = []
    fausseRoute('GET', (evenement) => {
      const fait = parametreFait(evenement)
      recus.push(fait)
      return fait === null ? TACHES : TACHES.filter((t) => String(t.fait) === fait)
    })
    const page = await mountSuspended(await chargerPage(), { route: '/taches' })
    const filtre = page.find('select[data-test="filtre"]')
    expect(filtre.exists(), 'il manque le <select data-test="filtre">').toBe(true)

    await filtre.setValue('faites')
    await vi.waitFor(() => expect(titresAffiches(page)).toHaveLength(1))
    expect(recus).toContain('true')

    await filtre.setValue('a-faire')
    await vi.waitFor(() => expect(titresAffiches(page)).toHaveLength(2))
    expect(recus).toContain('false')

    await filtre.setValue('toutes')
    await vi.waitFor(() => expect(titresAffiches(page)).toHaveLength(3))
  })

  it('le formulaire envoie le titre en POST, recharge la liste et vide le champ', async () => {
    const taches = [...TACHES]
    const envoyes: unknown[] = []
    fausseRoute('GET', () => taches)
    fausseRoute('POST', async (evenement) => {
      const corps = await corpsJson(evenement)
      envoyes.push(corps)
      const tache = { id: 4, titre: String(corps.titre), fait: false }
      taches.push(tache)
      return tache
    })
    const page = await mountSuspended(await chargerPage(), { route: '/taches' })

    await page.find('input[data-test="titre"]').setValue('Préparer le TP 05')
    await page.find('form[data-test="formulaire"]').trigger('submit')

    await vi.waitFor(() => expect(titresAffiches(page)).toHaveLength(4))
    expect(envoyes).toEqual([{ titre: 'Préparer le TP 05' }])
    expect(titresAffiches(page)[3]).toContain('Préparer le TP 05')
    expect((page.find('input[data-test="titre"]').element as HTMLInputElement).value).toBe('')
  })

  it('affiche un message si l\'API refuse la nouvelle tâche', async () => {
    fausseRoute('GET', () => TACHES)
    fausseRoute('POST', () => {
      throw createError({ status: 400, message: 'Le titre doit faire au moins 3 caractères.' })
    })
    const page = await mountSuspended(await chargerPage(), { route: '/taches' })

    await page.find('input[data-test="titre"]').setValue('Ab')
    await page.find('form[data-test="formulaire"]').trigger('submit')

    await vi.waitFor(() => {
      expect(page.find('[data-test="erreur-ajout"]').exists(), 'il manque data-test="erreur-ajout"').toBe(true)
    })
    expect(page.find('[data-test="erreur-ajout"]').text()).not.toBe('')
    expect(titresAffiches(page)).toHaveLength(3)
  })
})
