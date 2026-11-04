import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { useFetch } from '@tp/05-composable-fetch/useFetch.js'
import ListeUtilisateurs from '@tp/05-composable-fetch/ListeUtilisateurs.vue'

const utilisateurs = [
  { id: 1, nom: 'Ada Lovelace', email: 'ada@exemple.fr' },
  { id: 2, nom: 'Alan Turing', email: 'alan@exemple.fr' },
]

// Fausse réponse HTTP : seulement ce que useFetch utilise (ok, status, json).
function reponse(corps, statut = 200) {
  return { ok: statut >= 200 && statut < 300, status: statut, json: async () => corps }
}

// Remplace fetch par une fausse fonction. Vitest remet le vrai fetch
// après chaque test (option « unstubGlobals » dans vite.config.js).
function simulerFetch(implementation = async () => reponse(utilisateurs)) {
  const faux = vi.fn(implementation)
  vi.stubGlobal('fetch', faux)
  return faux
}

// fetch qui ne répond pas tout de suite : on appelle « repondre » quand on veut.
function simulerFetchEnAttente() {
  let repondre
  const faux = simulerFetch(() => new Promise((resolve) => (repondre = resolve)))
  return { faux, repondre: (valeur) => repondre(valeur) }
}

describe('useFetch', () => {
  it('met loading à true pendant la requête, puis remplit data', async () => {
    const { faux, repondre } = simulerFetchEnAttente()
    const { data, error, loading } = useFetch('/api/utilisateurs')
    await nextTick()
    expect(faux).toHaveBeenCalledTimes(1)
    expect(faux.mock.calls[0][0]).toBe('/api/utilisateurs')
    expect(loading.value).toBe(true)

    repondre(reponse(utilisateurs))
    await flushPromises()
    expect(loading.value).toBe(false)
    expect(data.value).toEqual(utilisateurs)
    expect(error.value).toBeNull()
  })

  it('remplit error quand le serveur répond une erreur (500)', async () => {
    simulerFetch(async () => reponse({ message: 'oups' }, 500))
    const { data, error, loading } = useFetch('/api/utilisateurs')
    await flushPromises()
    expect(error.value).toBeTruthy()
    expect(data.value).toBeNull()
    expect(loading.value).toBe(false)
  })

  it('remplit error quand le réseau ne répond pas', async () => {
    simulerFetch(async () => {
      throw new TypeError('Failed to fetch')
    })
    const { data, error, loading } = useFetch('/api/utilisateurs')
    await flushPromises()
    expect(error.value).toBeTruthy()
    expect(data.value).toBeNull()
    expect(loading.value).toBe(false)
  })

  it("relance la requête quand l'URL (un ref) change", async () => {
    const faux = simulerFetch()
    const url = ref('/api/page-1')
    useFetch(url)
    await flushPromises()
    url.value = '/api/page-2'
    await flushPromises()
    expect(faux).toHaveBeenCalledTimes(2)
    expect(faux.mock.lastCall[0]).toBe('/api/page-2')
  })

  it('refresh() relance la requête', async () => {
    const faux = simulerFetch()
    const { refresh } = useFetch('/api/utilisateurs')
    await flushPromises()
    await refresh()
    expect(faux).toHaveBeenCalledTimes(2)
  })
})

describe('ListeUtilisateurs', () => {
  const monter = () => mount(ListeUtilisateurs, { props: { url: '/api/utilisateurs' } })

  it('affiche « Chargement… » pendant la requête', async () => {
    simulerFetchEnAttente()
    const wrapper = monter()
    await nextTick()
    expect(wrapper.find('[data-test="chargement"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-test="utilisateur"]')).toHaveLength(0)
  })

  it('affiche la liste des utilisateurs', async () => {
    simulerFetch()
    const wrapper = monter()
    await flushPromises()
    const lignes = wrapper.findAll('[data-test="utilisateur"]')
    expect(lignes).toHaveLength(2)
    expect(lignes[0].text()).toContain('Ada Lovelace')
    expect(wrapper.find('[data-test="chargement"]').exists()).toBe(false)
  })

  it("affiche un message en cas d'erreur", async () => {
    simulerFetch(async () => reponse(null, 404))
    const wrapper = monter()
    await flushPromises()
    expect(wrapper.find('[data-test="erreur"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-test="utilisateur"]')).toHaveLength(0)
  })

  it('recharge la liste avec le bouton « Recharger »', async () => {
    const faux = simulerFetch()
    const wrapper = monter()
    await flushPromises()
    await wrapper.get('[data-test="recharger"]').trigger('click')
    await flushPromises()
    expect(faux).toHaveBeenCalledTimes(2)
    expect(wrapper.findAll('[data-test="utilisateur"]')).toHaveLength(2)
  })

  it('relance la requête quand la prop « url » change', async () => {
    const faux = simulerFetch()
    const wrapper = monter()
    await flushPromises()
    await wrapper.setProps({ url: '/api/autres-utilisateurs' })
    await flushPromises()
    expect(faux).toHaveBeenCalledTimes(2)
    expect(faux.mock.lastCall[0]).toBe('/api/autres-utilisateurs')
  })
})
