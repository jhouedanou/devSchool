import Inscription from '@tp/08-actions-react19/Inscription.jsx';

const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

// Faux serveur : « admin » est déjà pris, « panne » simule une erreur.
async function inscrireDemo(formData) {
  await attendre(1000);
  const pseudo = String(formData.get('pseudo') ?? '').trim();
  if (pseudo === 'panne') throw new Error('Serveur injoignable');
  if (pseudo === '') return { ok: false, message: 'Le pseudo est obligatoire.' };
  if (pseudo === 'admin') return { ok: false, message: 'Ce pseudo est déjà pris.' };
  return { ok: true, message: `Bienvenue ${pseudo} !` };
}

export default function Demo() {
  return (
    <>
      <Inscription inscrire={inscrireDemo} />
      <p className="astuce">Essaie les pseudos « admin » (déjà pris) et « panne » (erreur serveur).</p>
    </>
  );
}
