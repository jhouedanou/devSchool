import { useState } from 'react';
import FormulaireContact from '@tp/03-formulaire-contact/FormulaireContact.jsx';

export default function Demo() {
  const [dernierEnvoi, setDernierEnvoi] = useState(null);

  return (
    <>
      <FormulaireContact onEnvoyer={setDernierEnvoi} />
      <h3>Données reçues par onEnvoyer</h3>
      <pre>{dernierEnvoi ? JSON.stringify(dernierEnvoi, null, 2) : 'Rien pour l’instant.'}</pre>
    </>
  );
}
