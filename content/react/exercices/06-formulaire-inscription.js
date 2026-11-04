export default {
  id: '06-formulaire-inscription',
  titre: 'Formulaire d\'inscription',
  type: 'react',
  consigne: `Termine ce formulaire d'inscription avec des **champs contrôlés**.

1. Garde les quatre champs dans **un seul objet** d'état : \`{ pseudo: '', email: '', niveau: 'debutant', newsletter: false }\`.
2. Un seul \`handleChange\` pour tous les champs : utilise \`e.target.name\`, et \`e.target.checked\` pour la case à cocher.
3. Calcule les erreurs (état dérivé) :
   - pseudo de moins de 3 caractères → \`Le pseudo doit faire au moins 3 caractères.\`
   - email sans \`@\` → \`L'email est invalide.\`
4. Affiche chaque erreur dans un \`<p className="erreur">\`, **seulement après** la première tentative d'envoi.
5. À l'envoi : appelle \`e.preventDefault()\`. Si tout est valide, appelle la prop \`onInscription\` avec l'objet du formulaire et affiche \`<p className="succes">Bienvenue Ada !</p>\` (avec le pseudo saisi).`,
  depart: `import { useState } from 'react';

export default function Inscription({ onInscription }) {
  // TODO : un objet d'état pour les 4 champs
  // TODO : un état pour savoir si on a déjà essayé d'envoyer

  function handleChange(e) {
    // TODO
  }

  function handleSubmit(e) {
    // TODO
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label>
        Pseudo <input name="pseudo" />
      </label>
      <label>
        Email <input name="email" type="email" />
      </label>
      <label>
        Niveau
        <select name="niveau">
          <option value="debutant">Débutant</option>
          <option value="intermediaire">Intermédiaire</option>
          <option value="avance">Avancé</option>
        </select>
      </label>
      <label>
        <input type="checkbox" name="newsletter" /> Recevoir la newsletter
      </label>
      <button type="submit">S'inscrire</button>
    </form>
  );
}
`,
  solution: `import { useState } from 'react';

export default function Inscription({ onInscription }) {
  const [form, setForm] = useState({ pseudo: '', email: '', niveau: 'debutant', newsletter: false });
  const [essaye, setEssaye] = useState(false);
  const [inscrit, setInscrit] = useState(null);

  const erreurs = {};
  if (form.pseudo.length < 3) erreurs.pseudo = 'Le pseudo doit faire au moins 3 caractères.';
  if (!form.email.includes('@')) erreurs.email = "L'email est invalide.";
  const valide = Object.keys(erreurs).length === 0;

  function handleChange(e) {
    const { name, type, value, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setEssaye(true);
    if (!valide) return;
    onInscription(form);
    setInscrit(form.pseudo);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label>
        Pseudo <input name="pseudo" value={form.pseudo} onChange={handleChange} />
      </label>
      {essaye && erreurs.pseudo && <p className="erreur">{erreurs.pseudo}</p>}
      <label>
        Email <input name="email" type="email" value={form.email} onChange={handleChange} />
      </label>
      {essaye && erreurs.email && <p className="erreur">{erreurs.email}</p>}
      <label>
        Niveau
        <select name="niveau" value={form.niveau} onChange={handleChange}>
          <option value="debutant">Débutant</option>
          <option value="intermediaire">Intermédiaire</option>
          <option value="avance">Avancé</option>
        </select>
      </label>
      <label>
        <input type="checkbox" name="newsletter" checked={form.newsletter} onChange={handleChange} /> Recevoir la newsletter
      </label>
      <button type="submit">S'inscrire</button>
      {inscrit && <p className="succes">Bienvenue {inscrit} !</p>}
    </form>
  );
}
`,
  indices: [
    'Un seul gestionnaire : `setForm({ ...form, [name]: type === \'checkbox\' ? checked : value })`.',
    'Les erreurs se calculent à chaque rendu, avant le `return`. Un état `essaye` (booléen) dit s\'il faut les afficher.',
    'Dans `handleSubmit` : `e.preventDefault()`, puis `setEssaye(true)`, puis on s\'arrête si une erreur existe.',
  ],
  tests: [
    {
      nom: 'Envoie l\'objet complet du formulaire',
      aide: 'Chaque champ a `value` (ou `checked`) et `onChange={handleChange}`.',
      run: async (t) => {
        const onInscription = t.fn();
        const w = await t.mount({ onInscription });
        await w.get('input[name="pseudo"]').setValue('Ada');
        await w.get('input[name="email"]').setValue('ada@exemple.fr');
        await w.get('select[name="niveau"]').setValue('avance');
        await w.get('input[name="newsletter"]').setValue(true);
        await w.get('form').submit();
        t.expect(onInscription).toHaveBeenCalledWith({
          pseudo: 'Ada', email: 'ada@exemple.fr', niveau: 'avance', newsletter: true,
        });
      },
    },
    {
      nom: 'Garde les valeurs par défaut du niveau et de la newsletter',
      run: async (t) => {
        const onInscription = t.fn();
        const w = await t.mount({ onInscription });
        await w.get('input[name="pseudo"]').setValue('Grace');
        await w.get('input[name="email"]').setValue('grace@exemple.fr');
        await w.get('form').submit();
        t.expect(onInscription).toHaveBeenCalledWith({
          pseudo: 'Grace', email: 'grace@exemple.fr', niveau: 'debutant', newsletter: false,
        });
      },
    },
    {
      nom: 'Pas d\'erreur avant l\'envoi, deux erreurs après un envoi vide',
      aide: 'Affiche les erreurs seulement si l\'utilisateur a déjà essayé d\'envoyer.',
      run: async (t) => {
        const onInscription = t.fn();
        const w = await t.mount({ onInscription });
        t.expect(w.findAll('.erreur')).toHaveLength(0);
        await w.get('form').submit();
        const erreurs = w.findAll('.erreur').map((e) => e.text());
        t.expect(erreurs).toEqual(['Le pseudo doit faire au moins 3 caractères.', 'L\'email est invalide.']);
        t.expect(onInscription).not.toHaveBeenCalled();
      },
    },
    {
      nom: 'Une erreur disparaît dès que le champ est corrigé',
      aide: 'Calcule les erreurs à partir de l\'état à chaque rendu (ne les stocke pas).',
      run: async (t) => {
        const w = await t.mount({ onInscription: t.fn() });
        await w.get('form').submit();
        await w.get('input[name="pseudo"]').setValue('Ada');
        const erreurs = w.findAll('.erreur').map((e) => e.text());
        t.expect(erreurs).toEqual(['L\'email est invalide.']);
      },
    },
    {
      nom: 'Affiche le message de bienvenue après un envoi valide',
      run: async (t) => {
        const w = await t.mount({ onInscription: t.fn() });
        t.expect(w.find('.succes').exists()).toBe(false);
        await w.get('input[name="pseudo"]').setValue('Ada');
        await w.get('input[name="email"]').setValue('ada@exemple.fr');
        await w.get('form').submit();
        t.expect(w.get('.succes').text()).toBe('Bienvenue Ada !');
      },
    },
    {
      nom: 'L\'envoi ne recharge pas la page',
      aide: 'Appelle `e.preventDefault()` au début de `handleSubmit`.',
      run: async (t) => {
        const w = await t.mount({ onInscription: t.fn() });
        await w.get('form').submit();
        t.expect(t.logs.join(' ')).not.toContain('preventDefault');
      },
    },
  ],
};
