// import { useActionState } from 'react';
// import { useFormStatus } from 'react-dom';

// Bouton d'envoi. Il doit être rendu À L'INTÉRIEUR du <form>.
export function BoutonEnvoyer() {
  // TODO : lis `pending` avec useFormStatus().
  // TODO : pendant l'envoi, désactive le bouton et affiche « Envoi en cours ».
  return <button type="submit">S'inscrire</button>;
}

// `inscrire(formData)` est fourni en prop. Il renvoie une promesse :
//   - { ok: true,  message: 'Bienvenue …' }  → succès
//   - { ok: false, message: 'Ce pseudo…' }   → refus
//   - ou il lève une erreur (serveur en panne).
export default function Inscription({ inscrire }) {
  // TODO : crée l'état avec useActionState(action, etatInitial).
  //   L'action est async et reçoit (etatPrecedent, formData).
  //   - Appelle `await inscrire(formData)` et renvoie { statut: 'succes' | 'erreur', message }.
  //   - Si inscrire lève une erreur, renvoie
  //     { statut: 'erreur', message: 'Une erreur est survenue. Réessaie plus tard.' }.
  const etat = { statut: 'vide', message: '' };

  // TODO : remplace onSubmit par action={…} (l'action renvoyée par useActionState).
  //        React empêchera alors lui-même le rechargement de la page.
  return (
    <form className="inscription" onSubmit={(event) => event.preventDefault()}>
      <label>
        Pseudo <input name="pseudo" />
      </label>
      <label>
        Email <input name="email" type="email" />
      </label>

      <BoutonEnvoyer />

      {/* TODO : succès → <p role="status">…</p>, erreur → <p role="alert">…</p> */}
    </form>
  );
}
