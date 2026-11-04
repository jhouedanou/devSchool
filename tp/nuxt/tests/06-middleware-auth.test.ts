// TP 06 · Middleware d'authentification
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { ComputedRef, Ref } from 'vue'
import { clearNuxtState, useRouter } from '#imports'
import { chargerComposant, chargerFonction } from './outils'

interface Auth {
  utilisateur: Ref<{ nom: string } | null>
  estConnecte: ComputedRef<boolean>
  connecter: (nom: string) => void
  deconnecter: () => void
}

const chargerUseAuth = () => chargerFonction<() => Auth>('app/composables/useAuth.ts', 'useAuth')
const cheminActuel = () => useRouter().currentRoute.value.path

/** Monte toute l'application (app.vue) sur la route demandée. */
async function ouvrir(route: string) {
  const App = await chargerComposant('app/app.vue')
  return mountSuspended(App, { route })
}

beforeEach(() => {
  // Remet chaque useState à sa valeur de départ : personne n'est connecté.
  clearNuxtState(undefined, { reset: true })
})

describe('TP 06 · Middleware d\'authentification', () => {
  it('useAuth() : personne n\'est connecté au départ', async () => {
    const useAuth = await chargerUseAuth()
    const auth = useAuth()
    expect(auth.utilisateur.value).toBeNull()
    expect(auth.estConnecte.value).toBe(false)
  })

  it('useAuth() : connecter() puis deconnecter() changent l\'utilisateur partagé', async () => {
    const useAuth = await chargerUseAuth()
    useAuth().connecter('Ada')
    expect(useAuth().utilisateur.value).toEqual({ nom: 'Ada' })
    expect(useAuth().estConnecte.value).toBe(true)
    useAuth().deconnecter()
    expect(useAuth().utilisateur.value).toBeNull()
    expect(useAuth().estConnecte.value).toBe(false)
  })

  it('/compte redirige vers /connexion si personne n\'est connecté', async () => {
    await chargerFonction('app/middleware/auth.ts', 'default')
    const app = await ouvrir('/compte')
    await vi.waitFor(() => expect(cheminActuel()).toBe('/connexion'))
    expect(app.find('h1').text()).toBe('Connexion')
  })

  it('/compte s\'affiche quand l\'utilisateur est connecté', async () => {
    const useAuth = await chargerUseAuth()
    useAuth().connecter('Ada')
    const app = await ouvrir('/compte')
    expect(cheminActuel()).toBe('/compte')
    expect(app.find('h1').text()).toBe('Mon compte')
    expect(app.find('[data-test="bienvenue"]').text()).toBe('Bonjour Ada !')
  })

  it('le formulaire de /connexion connecte l\'utilisateur et ouvre /compte', async () => {
    const app = await ouvrir('/connexion')
    await app.get('input[data-test="nom"]').setValue('Grace')
    await app.get('form[data-test="formulaire-connexion"]').trigger('submit')

    await vi.waitFor(() => expect(cheminActuel()).toBe('/compte'))
    await vi.waitFor(() => expect(app.find('[data-test="bienvenue"]').text()).toBe('Bonjour Grace !'))
    const useAuth = await chargerUseAuth()
    expect(useAuth().utilisateur.value).toEqual({ nom: 'Grace' })
  })

  it('un nom vide ne connecte personne', async () => {
    const app = await ouvrir('/connexion')
    await app.get('input[data-test="nom"]').setValue('   ')
    await app.get('form[data-test="formulaire-connexion"]').trigger('submit')
    await new Promise((resolve) => setTimeout(resolve, 50))

    const useAuth = await chargerUseAuth()
    expect(useAuth().estConnecte.value).toBe(false)
    expect(cheminActuel()).toBe('/connexion')
  })

  it('le bouton « Se déconnecter » déconnecte et renvoie vers /connexion', async () => {
    const useAuth = await chargerUseAuth()
    useAuth().connecter('Ada')
    const app = await ouvrir('/compte')
    const bouton = app.get('[data-test="deconnexion"]')
    expect(bouton.text()).toBe('Se déconnecter')
    await bouton.trigger('click')

    await vi.waitFor(() => expect(cheminActuel()).toBe('/connexion'))
    expect(useAuth().estConnecte.value).toBe(false)
  })
})
