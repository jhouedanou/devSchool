import { useState } from 'react';

const VIDE = { nom: '', email: '', sujet: '', message: '' };

// Textes exacts attendus par les tests.
const MESSAGES = {
  nom: 'Le nom est obligatoire.',
  email: "L'adresse email n'est pas valide.",
  sujet: 'Choisis un sujet.',
  message: 'Le message doit contenir au moins 20 caractères.',
  confirmation: 'Merci, ton message a bien été envoyé.',
};

// Renvoie un objet { champ: message } ; vide si tout est valide.
function valider(donnees) {
  const erreurs = {};
  if (donnees.nom.trim() === '') erreurs.nom = MESSAGES.nom;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donnees.email.trim())) erreurs.email = MESSAGES.email;
  if (donnees.sujet === '') erreurs.sujet = MESSAGES.sujet;
  if (donnees.message.trim().length < 20) erreurs.message = MESSAGES.message;
  return erreurs;
}

export default function FormulaireContact({ onEnvoyer }) {
  const [donnees, setDonnees] = useState(VIDE);
  const [tentative, setTentative] = useState(false);
  const [envoye, setEnvoye] = useState(false);

  // Les erreurs se recalculent à chaque frappe, mais ne s'affichent qu'après une tentative.
  const erreurs = tentative ? valider(donnees) : {};

  function modifier(event) {
    const { name, value } = event.target;
    setDonnees({ ...donnees, [name]: value });
  }

  function envoyer(event) {
    event.preventDefault();
    setEnvoye(false);
    if (Object.keys(valider(donnees)).length > 0) {
      setTentative(true);
      return;
    }
    onEnvoyer({
      nom: donnees.nom.trim(),
      email: donnees.email.trim(),
      sujet: donnees.sujet,
      message: donnees.message.trim(),
    });
    setDonnees(VIDE);
    setTentative(false);
    setEnvoye(true);
  }

  return (
    <form onSubmit={envoyer} noValidate>
      <div className="champ">
        <label htmlFor="contact-nom">Nom</label>
        <input id="contact-nom" name="nom" value={donnees.nom} onChange={modifier} />
        {erreurs.nom && <p className="erreur">{erreurs.nom}</p>}
      </div>

      <div className="champ">
        <label htmlFor="contact-email">Email</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          value={donnees.email}
          onChange={modifier}
        />
        {erreurs.email && <p className="erreur">{erreurs.email}</p>}
      </div>

      <div className="champ">
        <label htmlFor="contact-sujet">Sujet</label>
        <select id="contact-sujet" name="sujet" value={donnees.sujet} onChange={modifier}>
          <option value="">-- Choisis un sujet --</option>
          <option value="question">Question</option>
          <option value="devis">Demande de devis</option>
          <option value="autre">Autre</option>
        </select>
        {erreurs.sujet && <p className="erreur">{erreurs.sujet}</p>}
      </div>

      <div className="champ">
        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          value={donnees.message}
          onChange={modifier}
        />
        {erreurs.message && <p className="erreur">{erreurs.message}</p>}
      </div>

      <button type="submit">Envoyer</button>

      {envoye && <p role="status">{MESSAGES.confirmation}</p>}
    </form>
  );
}
