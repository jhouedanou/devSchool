// Formate un montant en euros, à la française : 1234.5 → « 1 234,50 € ».
const formateur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

export function formaterPrix(montant) {
  return formateur.format(montant)
}
