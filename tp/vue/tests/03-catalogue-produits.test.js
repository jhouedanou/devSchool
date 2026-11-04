import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProduitCarte from '@tp/03-catalogue-produits/ProduitCarte.vue'
import Catalogue from '@tp/03-catalogue-produits/Catalogue.vue'

// Intl.NumberFormat met des espaces insécables (« 1 234,50 € »).
// On les remplace par des espaces normaux pour comparer.
const espaces = (texte) => texte.replace(/\s/g, ' ')

describe('ProduitCarte', () => {
  const lampe = { id: 7, nom: 'Lampe de bureau', prix: 34.5, stock: 4 }

  it('affiche le nom et le prix en euros', () => {
    const wrapper = mount(ProduitCarte, { props: { produit: lampe } })
    expect(wrapper.get('[data-test="nom"]').text()).toBe('Lampe de bureau')
    expect(espaces(wrapper.get('[data-test="prix"]').text())).toBe('34,50 €')
  })

  it("émet « ajouter » avec l'id du produit au clic", async () => {
    const wrapper = mount(ProduitCarte, { props: { produit: lampe } })
    await wrapper.get('[data-test="ajouter"]').trigger('click')
    expect(wrapper.emitted('ajouter')).toEqual([[7]])
  })

  it('affiche « Rupture de stock » et désactive le bouton si le stock est à 0', () => {
    const wrapper = mount(ProduitCarte, { props: { produit: { ...lampe, stock: 0 } } })
    expect(wrapper.get('[data-test="rupture"]').text()).toBe('Rupture de stock')
    expect(wrapper.get('[data-test="ajouter"]').element.disabled).toBe(true)
  })

  it("n'affiche pas « Rupture de stock » s'il reste du stock", () => {
    const wrapper = mount(ProduitCarte, { props: { produit: lampe } })
    expect(wrapper.find('[data-test="rupture"]').exists()).toBe(false)
    expect(wrapper.get('[data-test="ajouter"]').element.disabled).toBe(false)
  })
})

describe('Catalogue', () => {
  const produits = [
    { id: 1, nom: 'Clavier', prix: 50, stock: 3 },
    { id: 2, nom: 'Souris', prix: 20.5, stock: 0 },
    { id: 3, nom: 'Tapis de souris', prix: 9.9, stock: 8 },
  ]
  const monter = () => mount(Catalogue, { props: { produits } })
  const noms = (wrapper) => wrapper.findAll('[data-test="nom"]').map((n) => n.text())
  const total = (wrapper) => espaces(wrapper.get('[data-test="total"]').text())

  it('affiche un composant ProduitCarte par produit', () => {
    const wrapper = monter()
    const cartes = wrapper.findAllComponents(ProduitCarte)
    expect(cartes).toHaveLength(3)
    expect(cartes[0].props('produit')).toEqual(produits[0])
  })

  it('filtre les produits par nom, sans tenir compte des majuscules', async () => {
    const wrapper = monter()
    await wrapper.get('[data-test="recherche"]').setValue('SOURIS')
    expect(noms(wrapper)).toEqual(['Souris', 'Tapis de souris'])
  })

  it('affiche un message quand aucun produit ne correspond', async () => {
    const wrapper = monter()
    expect(wrapper.find('[data-test="aucun-resultat"]').exists()).toBe(false)
    await wrapper.get('[data-test="recherche"]').setValue('trottinette')
    expect(wrapper.findAllComponents(ProduitCarte)).toHaveLength(0)
    expect(wrapper.find('[data-test="aucun-resultat"]').exists()).toBe(true)
  })

  it('additionne les prix des produits ajoutés dans le total du panier', async () => {
    const wrapper = monter()
    expect(total(wrapper)).toBe('0,00 €')
    const cartes = wrapper.findAllComponents(ProduitCarte)
    await cartes[0].get('[data-test="ajouter"]').trigger('click')
    await cartes[2].get('[data-test="ajouter"]').trigger('click')
    expect(total(wrapper)).toBe('59,90 €')
    await cartes[0].get('[data-test="ajouter"]').trigger('click')
    expect(total(wrapper)).toBe('109,90 €')
  })
})
