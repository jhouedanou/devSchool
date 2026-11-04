import { useState } from 'react';

const VIDE = { nom: '', email: '', sujet: '', message: '' };

// Textes exacts attendus par les tests : utilise-les tels quels.
const MESSAGES = {
  nom: 'Le nom est obligatoire.',
  email: "L'adresse email n'est pas valide.",
  sujet: 'Choisis un sujet.',
  message: 'Le message doit contenir au moins 20 caractères.',
  confirmation: 'Merci, ton message a bien été envoyé.',
};

// Renvoie un objet { champ: message d'erreur }. Objet vide = tout est valide.
function valider(donnees) {
  const erreurs = {};
  // TODO : nom vide (après trim) → erreurs.nom = MESSAGES.nom
  // TODO : email invalide → erreurs.email = MESSAGES.email
  //        (astuce : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  // TODO : aucun sujet choisi → erreurs.sujet = MESSAGES.sujet
  // TODO : message de moins de 20 caractères (après trim) → erreurs.message = MESSAGES.message
  return erreurs;
}

export default function FormulaireContact({ onEnvoyer }) {
  const [donnees, setDonnees] = useState(VIDE);
  // TODO : ajoute un état `tentative` (false au départ) : passe à true après un envoi raté.
  // TODO : ajoute un état `envoye` (false au départ) pour afficher la confirmation.

  // TODO : n'affiche les erreurs qu'après une tentative d'envoi.
  const erreurs = {};

  function modifier(event) {
    // TODO : un seul gestionnaire pour tous les champs, grâce à event.target.name.
  }

  function envoyer(event) {
    event.preventDefault();
    // TODO : si valider(donnees) trouve des erreurs → tentative = true, et on s'arrête.
    // TODO : sinon → appelle onEnvoyer({ nom, email, sujet, message }) avec les textes « trimés »,
    //        vide le formulaire, remets tentative à false et affiche la confirmation.
  }

  return (
    <form onSubmit={envoyer} noValidate>
      {/* TODO : rends chaque champ contrôlé : value={donnees.…} et onChange={modifier}. */}
      <div className="champ">
        <label htmlFor="contact-nom">Nom</label>
        <input id="contact-nom" name="nom" />
        {erreurs.nom && <p className="erreur">{erreurs.nom}</p>}
      </div>

      <div className="champ">
        <label htmlFor="contact-email">Email</label>
        <input id="contact-email" name="email" type="email" />
        {erreurs.email && <p className="erreur">{erreurs.email}</p>}
      </div>

      <div className="champ">
        <label htmlFor="contact-sujet">Sujet</label>
        <select id="contact-sujet" name="sujet">
          <option value="">-- Choisis un sujet --</option>
          <option value="question">Question</option>
          <option value="devis">Demande de devis</option>
          <option value="autre">Autre</option>
        </select>
        {erreurs.sujet && <p className="erreur">{erreurs.sujet}</p>}
      </div>

      <div className="champ">
        <label htmlFor="contact-message">Message</label>
        <textarea id="contact-message" name="message" rows={4} />
        {erreurs.message && <p className="erreur">{erreurs.message}</p>}
      </div>

      <button type="submit">Envoyer</button>

      {/* TODO : affiche <p role="status">{MESSAGES.confirmation}</p> après un envoi réussi. */}
    </form>
  );
}
