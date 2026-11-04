import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { usePanierStore } from '@tp/06-panier-pinia/stores/panier.js'
import Panier from '@tp/06-panier-pinia/Panier.vue'

const stylo = { id: 1, nom: 'Stylo', prix: 1.5 }
const cahier = { id: 2, nom: 'Cahier', prix: 3.2 }

// Intl.NumberFormat met des espaces insécables : on les remplace pour comparer.
const espaces = (texte) => texte.replace(/\s/g, ' ')

describe('Store panier', () => {
  // Une Pinia neuve pour chaque test : les tests ne se gênent pas.
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('démarre vide', () => {
    const panier = usePanierStore()
    expect(panier.articles).toEqual([])
    expect(panier.total).toBe(0)
    expect(panier.nombreArticles).toBe(0)
  })

  it('ajouter() ajoute un produit avec la quantité 1', () => {
    const panier = usePanierStore()
    panier.ajouter(stylo)
    expect(panier.articles).toHaveLength(1)
    expect(panier.articles[0]).toMatchObject({ id: 1, nom: 'Stylo', prix: 1.5, quantite: 1 })
  })

  it('ajouter() augmente la quantité si le produit est déjà dans le panier', () => {
    const panier = usePanierStore()
    panier.ajouter(stylo)
    panier.ajouter(stylo)
    expect(panier.articles).toHaveLength(1)
    expect(panier.articles[0].quantite).toBe(2)
  })

  it("calcule le total et le nombre d'articles", () => {
    const panier = usePanierStore()
    panier.ajouter(stylo)
    panier.ajouter(stylo)
    panier.ajouter(cahier)
    expect(panier.total).toBeCloseTo(6.2)
    expect(panier.nombreArticles).toBe(3)
  })

  it("retirer() enlève l'article", () => {
    const panier = usePanierStore()
    panier.ajouter(stylo)
    panier.ajouter(cahier)
    panier.retirer(1)
    expect(panier.articles.map((article) => article.id)).toEqual([2])
  })

  it('vider() vide le panier', () => {
    const panier = usePanierStore()
    panier.ajouter(stylo)
    panier.ajouter(cahier)
    panier.vider()
    expect(panier.articles).toEqual([])
    expect(panier.total).toBe(0)
  })
})

describe('Panier.vue', () => {
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
  })

  // Le composant et le test utilisent la même Pinia, donc le même store.
  const monter = () => mount(Panier, { global: { plugins: [pinia] } })

  it("affiche « Ton panier est vide. » quand il n'y a rien", () => {
    const wrapper = monter()
    expect(wrapper.get('[data-test="vide"]').text()).toBe('Ton panier est vide.')
    expect(wrapper.findAll('[data-test="article"]')).toHaveLength(0)
  })

  it('affiche les articles du store, leur quantité et le total', () => {
    const panier = usePanierStore()
    panier.ajouter(stylo)
    panier.ajouter(stylo)
    panier.ajouter(cahier)
    const wrapper = monter()
    const lignes = wrapper.findAll('[data-test="article"]')
    expect(lignes).toHaveLength(2)
    expect(lignes[0].text()).toContain('Stylo')
    expect(lignes[0].get('[data-test="quantite"]').text()).toBe('2')
    expect(espaces(wrapper.get('[data-test="total"]').text())).toBe('6,20 €')
    expect(wrapper.find('[data-test="vide"]').exists()).toBe(false)
  })

  it('« Retirer » et « Vider le panier » modifient le store', async () => {
    const panier = usePanierStore()
    panier.ajouter(stylo)
    panier.ajouter(cahier)
    const wrapper = monter()

    await wrapper.findAll('[data-test="article"]')[0].get('[data-test="retirer"]').trigger('click')
    expect(panier.articles.map((article) => article.id)).toEqual([2])
    expect(wrapper.findAll('[data-test="article"]')).toHaveLength(1)

    await wrapper.get('[data-test="vider"]').trigger('click')
    expect(panier.articles).toEqual([])
    expect(wrapper.find('[data-test="vide"]').exists()).toBe(true)
  })
})
