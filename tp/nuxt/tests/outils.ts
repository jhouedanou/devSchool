// Outils partagés par les tests de l'application. Tu n'as pas besoin de modifier ce fichier.
//
// Les tests chargent tes fichiers avec ces fonctions plutôt qu'avec un `import` classique.
// Si un fichier manque encore, le test échoue avec un message clair
// (« Fichier introuvable : … ») au lieu d'une erreur d'import difficile à lire.
import type { Component } from 'vue'

const fichiers = import.meta.glob<Record<string, unknown>>(['../app/**/*.vue', '../app/**/*.ts'])

/** Charge un module de l'application. `chemin` est relatif à tp/nuxt (ex. « app/utils/produits.ts »). */
export async function chargerModule<T = Record<string, unknown>>(chemin: string): Promise<T> {
  const charger = fichiers[`../${chemin}`]
  if (!charger) {
    throw new Error(
      `Fichier introuvable : ${chemin}\n`
      + 'Crée ce fichier en suivant l\'énoncé, puis relance les tests.',
    )
  }
  return (await charger()) as T
}

/** Charge le composant exporté par défaut d'un fichier .vue. */
export async function chargerComposant(chemin: string): Promise<Component> {
  const module = await chargerModule<{ default?: Component }>(chemin)
  if (!module.default) {
    throw new Error(`${chemin} doit exporter un composant par défaut.`)
  }
  return module.default
}

/** Charge une fonction exportée par son nom (ex. « usePanier » dans app/composables/usePanier.ts). */
export async function chargerFonction<F extends (...args: never[]) => unknown>(chemin: string, nom: string): Promise<F> {
  const module = await chargerModule(chemin)
  const valeur = module[nom]
  if (typeof valeur !== 'function') {
    throw new Error(`${chemin} doit exporter une fonction nommée « ${nom} ».`)
  }
  return valeur as F
}
