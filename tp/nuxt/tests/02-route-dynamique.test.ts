// TP 02 · Route dynamique /produits/[id]
import { describe, it, expect, afterEach, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import { defineComponent, h, onErrorCaptured, type Component } from 'vue'
import { clearError, createError, showError, useError, useRouter, type NuxtError } from '#imports'
import { chargerComposant, chargerModule } from './outils'

interface Produit { id: number, nom: string, prix: number, description: string }
interface ModuleProduits { produits?: Produit[], trouverProduit?: (id: number) => Produit | undefined }

/** Monte une page et renvoie l'erreur levée pendant son affichage (ou undefined). */
async function erreurDeLaPage(Page: Component, route: string): Promise<NuxtError | undefined> {
  let erreur: NuxtError | undefined
  const Capture = defineComponent({
    setup() {
      onErrorCaptured((e) => {
        erreur = e as NuxtError
        return false
      })
      return () => h(Page)
    },
  })
  await mountSuspended(Capture, { route })
  await flushPromises()
  return erreur
}

afterEach(async () => {
  await clearError()
})

describe('TP 02 · Route dynamique /produits/[id]', () => {
  it('app/utils/produits.ts exporte les 3 produits et trouverProduit()', async () => {
    const { produits, trouverProduit } = await chargerModule<ModuleProduits>('app/utils/produits.ts')
    expect(produits?.map(({ id, nom, prix }) => ({ id, nom, prix }))).toEqual([
      { id: 1, nom: 'Clavier', prix: 49 },
      { id: 2, nom: 'Souris', prix: 25 },
      { id: 3, nom: 'Écran', prix: 199 },
    ])
    expect(trouverProduit, 'trouverProduit doit être exportée').toBeTypeOf('function')
    expect(trouverProduit!(2)?.nom).toBe('Souris')
    expect(trouverProduit!(42)).toBeUndefined()
  })

  it('la page /produits liste les produits avec un lien vers chaque fiche', async () => {
    const Page = await chargerComposant('app/pages/produits/index.vue')
    const page = await mountSuspended(Page, { route: '/produits' })
    expect(page.find('h1').text()).toBe('Produits')
    const lignes = page.findAll('[data-test="produit"]')
    expect(lignes).toHaveLength(3)
    expect(lignes[0]!.text()).toContain('Clavier')
    const liens = page.findAll('[data-test="produit"] a').map((lien) => lien.attributes('href'))
    expect(liens).toEqual(['/produits/1', '/produits/2', '/produits/3'])
  })

  it('la page /produits/2 affiche le nom et le prix du produit', async () => {
    const Page = await chargerComposant('app/pages/produits/[id].vue')
    const page = await mountSuspended(Page, { route: '/produits/2' })
    expect(page.find('h1').text()).toBe('Souris')
    expect(page.find('[data-test="prix"]').text()).toMatch(/^25\s*€$/)
  })

  it('la page /produits/42 lève une erreur 404 fatale « Produit introuvable »', async () => {
    const Page = await chargerComposant('app/pages/produits/[id].vue')
    const erreur = await erreurDeLaPage(Page, '/produits/42')
    expect(erreur, 'la page doit lever une erreur avec throw createError(…)').toBeDefined()
    expect(erreur!.status).toBe(404)
    expect(erreur!.statusText).toBe('Produit introuvable')
    expect(erreur!.fatal, 'ajoute fatal: true pour afficher la page d\'erreur').toBe(true)
  })

  it('la page d\'erreur (app/error.vue) affiche le code et le message', async () => {
    const PageErreur = await chargerComposant('app/error.vue')
    const erreur = createError({ status: 404, statusText: 'Produit introuvable' })
    const page = await mountSuspended(PageErreur, { props: { error: erreur } })
    expect(page.find('[data-test="code-erreur"]').text()).toBe('404')
    expect(page.find('[data-test="message-erreur"]').text()).toBe('Produit introuvable')
  })

  it('le bouton « Retour à l\'accueil » efface l\'erreur et ramène sur /', async () => {
    const PageErreur = await chargerComposant('app/error.vue')
    const erreur = showError({ status: 404, statusText: 'Produit introuvable' })
    const page = await mountSuspended(PageErreur, { props: { error: erreur }, route: '/produits/42' })
    const bouton = page.find('[data-test="retour-accueil"]')
    expect(bouton.exists(), 'il manque le bouton data-test="retour-accueil"').toBe(true)
    expect(bouton.text()).toBe('Retour à l\'accueil')
    await bouton.trigger('click')
    await vi.waitFor(() => {
      expect(useError().value, 'utilise clearError() pour effacer l\'erreur').toBeFalsy()
      expect(useRouter().currentRoute.value.path).toBe('/')
    })
  })

  it('la navigation du layout contient un lien vers /produits', async () => {
    const Layout = await chargerComposant('app/layouts/default.vue')
    const layout = await mountSuspended(Layout)
    const liens = layout.findAll('nav a').map((lien) => lien.attributes('href'))
    expect(liens).toContain('/produits')
  })
})
