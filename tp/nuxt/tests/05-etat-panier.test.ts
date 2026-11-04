// TP 05 · État partagé avec useState
import { describe, it, expect, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, h, type ComputedRef, type Ref } from 'vue'
import { clearNuxtState } from '#imports'
import { chargerComposant, chargerFonction } from './outils'

interface Produit { id: number, nom: string, prix: number, description: string }
interface LignePanier { id: number, nom: string, prix: number, quantite: number }
interface Panier {
  lignes: Ref<LignePanier[]>
  ajouter: (produit: Produit) => void
  retirer: (id: number) => void
  nombre: ComputedRef<number>
  total: ComputedRef<number>
}

const CLAVIER: Produit = { id: 1, nom: 'Clavier', prix: 49, description: 'Un clavier mécanique compact.' }
const SOURIS: Produit = { id: 2, nom: 'Souris', prix: 25, description: 'Une souris sans fil, légère et précise.' }

const chargerUsePanier = () => chargerFonction<() => Panier>('app/composables/usePanier.ts', 'usePanier')

beforeEach(() => {
  // Remet chaque useState à sa valeur de départ entre deux tests.
  clearNuxtState(undefined, { reset: true })
})

describe('TP 05 · État partagé avec useState', () => {
  it('usePanier() démarre avec un panier vide', async () => {
    const usePanier = await chargerUsePanier()
    const panier = usePanier()
    expect(panier.lignes.value).toEqual([])
    expect(panier.nombre.value).toBe(0)
    expect(panier.total.value).toBe(0)
  })

  it('ajouter() deux fois le même produit augmente sa quantité', async () => {
    const usePanier = await chargerUsePanier()
    const panier = usePanier()
    panier.ajouter(CLAVIER)
    panier.ajouter(CLAVIER)
    expect(panier.lignes.value).toEqual([{ id: 1, nom: 'Clavier', prix: 49, quantite: 2 }])
    expect(panier.nombre.value).toBe(2)
  })

  it('total additionne prix × quantité de chaque ligne', async () => {
    const usePanier = await chargerUsePanier()
    const panier = usePanier()
    panier.ajouter(CLAVIER)
    panier.ajouter(CLAVIER)
    panier.ajouter(SOURIS)
    expect(panier.nombre.value).toBe(3)
    expect(panier.total.value).toBe(123)
  })

  it('retirer(id) enlève la ligne du produit', async () => {
    const usePanier = await chargerUsePanier()
    const panier = usePanier()
    panier.ajouter(CLAVIER)
    panier.ajouter(SOURIS)
    panier.retirer(1)
    expect(panier.lignes.value.map((ligne) => ligne.id)).toEqual([2])
    expect(panier.total.value).toBe(25)
  })

  it('l\'état est partagé entre deux appels à usePanier()', async () => {
    const usePanier = await chargerUsePanier()
    usePanier().ajouter(SOURIS)
    expect(usePanier().nombre.value, 'utilise useState pour partager les lignes').toBe(1)
  })

  it('ResumePanier affiche « Panier vide » quand le panier est vide', async () => {
    const ResumePanier = await chargerComposant('app/components/ResumePanier.vue')
    const resume = await mountSuspended(ResumePanier)
    expect(resume.find('[data-test="resume-panier"]').text()).toBe('Panier vide')
  })

  it('cliquer sur BoutonAjouter met à jour ResumePanier', async () => {
    const BoutonAjouter = await chargerComposant('app/components/BoutonAjouter.vue')
    const ResumePanier = await chargerComposant('app/components/ResumePanier.vue')
    const Boutique = defineComponent({
      render: () => h('div', [
        h(BoutonAjouter, { produit: CLAVIER }),
        h(BoutonAjouter, { produit: SOURIS }),
        h(ResumePanier),
      ]),
    })
    const boutique = await mountSuspended(Boutique)
    const boutons = boutique.findAll('[data-test="bouton-ajouter"]')
    expect(boutons).toHaveLength(2)
    expect(boutons[0]!.text()).toBe('Ajouter au panier')

    await boutons[0]!.trigger('click')
    await boutons[0]!.trigger('click')
    await boutons[1]!.trigger('click')

    expect(boutique.find('[data-test="panier-nombre"]').text()).toBe('3')
    expect(boutique.find('[data-test="panier-total"]').text()).toMatch(/^123\s*€$/)
  })

  it('la fiche produit a un BoutonAjouter et le layout affiche ResumePanier', async () => {
    const PageProduit = await chargerComposant('app/pages/produits/[id].vue')
    const page = await mountSuspended(PageProduit, { route: '/produits/2' })
    await page.get('[data-test="bouton-ajouter"]').trigger('click')
    const usePanier = await chargerUsePanier()
    expect(usePanier().lignes.value.map((ligne) => ligne.nom)).toEqual(['Souris'])

    const Layout = await chargerComposant('app/layouts/default.vue')
    const layout = await mountSuspended(Layout)
    expect(layout.find('header [data-test="resume-panier"]').exists(), 'ajoute <ResumePanier /> dans le <header> du layout').toBe(true)
    expect(layout.find('[data-test="panier-nombre"]').text()).toBe('1')
  })
})
