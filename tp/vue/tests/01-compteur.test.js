import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Compteur from '@tp/01-compteur/Compteur.vue'

// Petites aides pour lire le composant.
const valeur = (wrapper) => wrapper.get('[data-test="valeur"]').text()
const moins = (wrapper) => wrapper.get('[data-test="moins"]')
const plus = (wrapper) => wrapper.get('[data-test="plus"]')
const reinitialiser = (wrapper) => wrapper.get('[data-test="reinitialiser"]')

describe('Compteur', () => {
  it('affiche la valeur « initial »', () => {
    const wrapper = mount(Compteur, { props: { initial: 4 } })
    expect(valeur(wrapper)).toBe('4')
  })

  it('commence à « min » quand « initial » est absent', () => {
    const wrapper = mount(Compteur, { props: { min: 3 } })
    expect(valeur(wrapper)).toBe('3')
  })

  it('ramène « initial » entre min et max', () => {
    const wrapper = mount(Compteur, { props: { initial: 50, max: 10 } })
    expect(valeur(wrapper)).toBe('10')
  })

  it('ajoute « pas » quand on clique sur « + »', async () => {
    const wrapper = mount(Compteur, { props: { pas: 2 } })
    await plus(wrapper).trigger('click')
    await plus(wrapper).trigger('click')
    expect(valeur(wrapper)).toBe('4')
  })

  it('retire « pas » quand on clique sur « − »', async () => {
    const wrapper = mount(Compteur, { props: { initial: 5, pas: 2 } })
    await moins(wrapper).trigger('click')
    expect(valeur(wrapper)).toBe('3')
  })

  it('désactive « − » quand la valeur est égale à min', () => {
    const wrapper = mount(Compteur, { props: { min: 0, initial: 0 } })
    expect(moins(wrapper).element.disabled).toBe(true)
    expect(plus(wrapper).element.disabled).toBe(false)
  })

  it('désactive « + » quand la valeur atteint max', async () => {
    const wrapper = mount(Compteur, { props: { initial: 9, max: 10 } })
    expect(plus(wrapper).element.disabled).toBe(false)
    await plus(wrapper).trigger('click')
    expect(valeur(wrapper)).toBe('10')
    expect(plus(wrapper).element.disabled).toBe(true)
  })

  it('ne dépasse jamais max, même avec un grand pas', async () => {
    const wrapper = mount(Compteur, { props: { initial: 8, max: 10, pas: 5 } })
    await plus(wrapper).trigger('click')
    expect(valeur(wrapper)).toBe('10')
  })

  it('ne descend jamais sous min, même avec un grand pas', async () => {
    const wrapper = mount(Compteur, { props: { initial: 2, min: 0, pas: 5 } })
    await moins(wrapper).trigger('click')
    expect(valeur(wrapper)).toBe('0')
  })

  it('« Réinitialiser » remet la valeur de départ', async () => {
    const wrapper = mount(Compteur, { props: { initial: 4 } })
    await plus(wrapper).trigger('click')
    await plus(wrapper).trigger('click')
    expect(valeur(wrapper)).toBe('6')
    await reinitialiser(wrapper).trigger('click')
    expect(valeur(wrapper)).toBe('4')
  })
})
