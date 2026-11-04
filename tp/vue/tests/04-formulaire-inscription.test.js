import { afterEach, describe, expect, it } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import Inscription from '@tp/04-formulaire-inscription/Inscription.vue'

// Le composant est attaché au document : un clic sur le bouton « submit »
// envoie alors le formulaire, comme dans le navigateur.
enableAutoUnmount(afterEach)
const monter = () => mount(Inscription, { attachTo: document.body })

// Tape une valeur, puis quitte le champ (blur).
async function saisir(wrapper, champ, valeur) {
  const input = wrapper.get(`[data-test="${champ}"]`)
  await input.setValue(valeur)
  await input.trigger('blur')
}

async function remplirSansCgu(wrapper) {
  await saisir(wrapper, 'nom', 'Ada Lovelace')
  await saisir(wrapper, 'email', 'ada@exemple.fr')
  await saisir(wrapper, 'mot-de-passe', 'machine-analytique')
  await saisir(wrapper, 'confirmation', 'machine-analytique')
}

const erreur = (wrapper, champ) => wrapper.find(`[data-test="erreur-${champ}"]`)
const bouton = (wrapper) => wrapper.get('[data-test="envoyer"]')

describe('Inscription', () => {
  it("n'affiche aucune erreur au départ", () => {
    const wrapper = monter()
    expect(wrapper.find('[data-test^="erreur-"]').exists()).toBe(false)
  })

  it('désactive le bouton « Créer mon compte » au départ', () => {
    const wrapper = monter()
    expect(bouton(wrapper).element.disabled).toBe(true)
  })

  it('affiche une erreur si le nom est vide', async () => {
    const wrapper = monter()
    await saisir(wrapper, 'nom', '   ')
    expect(erreur(wrapper, 'nom').exists()).toBe(true)
  })

  it("affiche une erreur pour un email invalide, puis l'enlève quand il est corrigé", async () => {
    const wrapper = monter()
    await saisir(wrapper, 'email', 'ada@')
    expect(erreur(wrapper, 'email').exists()).toBe(true)
    await saisir(wrapper, 'email', 'ada@exemple.fr')
    expect(erreur(wrapper, 'email').exists()).toBe(false)
  })

  it('exige au moins 8 caractères pour le mot de passe', async () => {
    const wrapper = monter()
    await saisir(wrapper, 'mot-de-passe', '1234567')
    expect(erreur(wrapper, 'mot-de-passe').exists()).toBe(true)
    await saisir(wrapper, 'mot-de-passe', '12345678')
    expect(erreur(wrapper, 'mot-de-passe').exists()).toBe(false)
  })

  it('signale une confirmation différente du mot de passe', async () => {
    const wrapper = monter()
    await saisir(wrapper, 'mot-de-passe', 'machine-analytique')
    await saisir(wrapper, 'confirmation', 'machine-analytiqu')
    expect(erreur(wrapper, 'confirmation').exists()).toBe(true)
  })

  it('garde le bouton désactivé tant que les CGU ne sont pas cochées', async () => {
    const wrapper = monter()
    await remplirSansCgu(wrapper)
    expect(bouton(wrapper).element.disabled).toBe(true)
    await wrapper.get('[data-test="cgu"]').setValue(true)
    expect(bouton(wrapper).element.disabled).toBe(false)
  })

  it('émet « inscrit » avec { nom, email } quand on envoie le formulaire', async () => {
    const wrapper = monter()
    await remplirSansCgu(wrapper)
    await wrapper.get('[data-test="cgu"]').setValue(true)
    await bouton(wrapper).trigger('click')
    expect(wrapper.emitted('inscrit')).toEqual([[{ nom: 'Ada Lovelace', email: 'ada@exemple.fr' }]])
  })

  it("n'émet rien si le formulaire est invalide (touche Entrée)", async () => {
    const wrapper = monter()
    await saisir(wrapper, 'nom', 'Ada Lovelace')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('inscrit')).toBeUndefined()
  })
})
