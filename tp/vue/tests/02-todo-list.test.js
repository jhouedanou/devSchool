import { afterEach, describe, expect, it } from 'vitest'
import { enableAutoUnmount, mount } from '@vue/test-utils'
import TodoList from '@tp/02-todo-list/TodoList.vue'

// Le composant est attaché au document : un clic sur un bouton « submit »
// envoie alors le formulaire, comme dans le navigateur.
enableAutoUnmount(afterEach)
const monter = () => mount(TodoList, { attachTo: document.body })

async function ajouterTache(wrapper, texte) {
  await wrapper.get('[data-test="nouvelle-tache"]').setValue(texte)
  await wrapper.get('[data-test="ajouter"]').trigger('click')
}

// Textes des tâches affichées, dans l'ordre.
const textes = (wrapper) =>
  wrapper.findAll('[data-test="tache"]').map((li) => li.get('[data-test="texte"]').text())

// Coche la case de la tâche n° « index » (à partir de 0).
async function cocher(wrapper, index) {
  const tache = wrapper.findAll('[data-test="tache"]')[index]
  await tache.get('[data-test="case"]').setValue(true)
}

const restantes = (wrapper) => wrapper.get('[data-test="restantes"]').text()

describe('TodoList', () => {
  it('ajoute une tâche avec le bouton « Ajouter »', async () => {
    const wrapper = monter()
    await ajouterTache(wrapper, 'Acheter du pain')
    expect(textes(wrapper)).toEqual(['Acheter du pain'])
  })

  it('nettoie le texte avec trim()', async () => {
    const wrapper = monter()
    await ajouterTache(wrapper, '   Lait   ')
    expect(textes(wrapper)).toEqual(['Lait'])
  })

  it("refuse une tâche vide ou faite d'espaces", async () => {
    const wrapper = monter()
    await ajouterTache(wrapper, '')
    await ajouterTache(wrapper, '    ')
    expect(wrapper.findAll('[data-test="tache"]')).toHaveLength(0)
  })

  it("vide le champ après l'ajout", async () => {
    const wrapper = monter()
    await ajouterTache(wrapper, 'Réviser Vue')
    expect(wrapper.get('[data-test="nouvelle-tache"]').element.value).toBe('')
  })

  it('supprime une tâche', async () => {
    const wrapper = monter()
    await ajouterTache(wrapper, 'A')
    await ajouterTache(wrapper, 'B')
    await wrapper.findAll('[data-test="tache"]')[0].get('[data-test="supprimer"]').trigger('click')
    expect(textes(wrapper)).toEqual(['B'])
  })

  it('compte les tâches restantes (singulier et pluriel)', async () => {
    const wrapper = monter()
    await ajouterTache(wrapper, 'A')
    await ajouterTache(wrapper, 'B')
    expect(restantes(wrapper)).toBe('2 tâches restantes')
    await cocher(wrapper, 0)
    expect(restantes(wrapper)).toBe('1 tâche restante')
    await cocher(wrapper, 1)
    expect(restantes(wrapper)).toBe('0 tâche restante')
  })

  it('filtre « Actives » : affiche seulement les tâches à faire', async () => {
    const wrapper = monter()
    await ajouterTache(wrapper, 'A')
    await ajouterTache(wrapper, 'B')
    await ajouterTache(wrapper, 'C')
    await cocher(wrapper, 1)
    await wrapper.get('[data-test="filtre-actives"]').trigger('click')
    expect(textes(wrapper)).toEqual(['A', 'C'])
  })

  it('filtres « Terminées » puis « Toutes »', async () => {
    const wrapper = monter()
    await ajouterTache(wrapper, 'A')
    await ajouterTache(wrapper, 'B')
    await ajouterTache(wrapper, 'C')
    await cocher(wrapper, 1)
    await wrapper.get('[data-test="filtre-terminees"]').trigger('click')
    expect(textes(wrapper)).toEqual(['B'])
    await wrapper.get('[data-test="filtre-toutes"]').trigger('click')
    expect(textes(wrapper)).toEqual(['A', 'B', 'C'])
  })
})
