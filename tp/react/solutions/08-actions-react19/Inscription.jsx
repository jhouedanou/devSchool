import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

const ETAT_INITIAL = { statut: 'vide', message: '' };
const MESSAGE_PANNE = 'Une erreur est survenue. Réessaie plus tard.';

// Doit être rendu À L'INTÉRIEUR du <form> : useFormStatus lit l'état du formulaire parent.
export function BoutonEnvoyer() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Envoi en cours' : "S'inscrire"}
    </button>
  );
}

export default function Inscription({ inscrire }) {
  // L'action reçoit l'état précédent PUIS les données du formulaire.
  const [etat, actionFormulaire] = useActionState(async (etatPrecedent, formData) => {
    try {
      const { ok, message } = await inscrire(formData);
      return { statut: ok ? 'succes' : 'erreur', message };
    } catch {
      return { statut: 'erreur', message: MESSAGE_PANNE };
    }
  }, ETAT_INITIAL);

  return (
    <form action={actionFormulaire} className="inscription">
      <label>
        Pseudo <input name="pseudo" />
      </label>
      <label>
        Email <input name="email" type="email" />
      </label>

      <BoutonEnvoyer />

      {etat.statut === 'succes' && <p role="status">{etat.message}</p>}
      {etat.statut === 'erreur' && <p role="alert">{etat.message}</p>}
    </form>
  );
}
