export default {
  id: '02-carte-profil',
  titre: 'Carte de profil',
  type: 'react',
  consigne: `Le composant \`CarteProfil\` reçoit ses données par les **props**.

1. Déstructure les props : \`nom\`, \`role\` (valeur par défaut : \`'Développeur'\`), \`children\` et \`onContacter\`.
2. Affiche le nom dans le \`<h2>\` et le rôle dans \`<p className="role">\`.
3. Complète le composant \`Avatar\` : il reçoit la prop \`nom\` et affiche **la première lettre** du nom dans \`<span className="avatar">\`. Utilise-le dans la carte : \`<Avatar nom={nom} />\`.
4. Affiche \`children\` dans \`<div className="bio">\`.
5. Au clic sur le bouton « Contacter », appelle \`onContacter\` avec le nom.`,
  depart: `function Avatar() {
  // TODO : recevoir la prop nom et afficher sa première lettre
  return <span className="avatar">?</span>;
}

export default function CarteProfil(props) {
  // TODO : déstructurer les props (avec une valeur par défaut pour role)
  return (
    <article className="carte">
      <h2>Nom</h2>
      <p className="role">Rôle</p>
      <div className="bio">{/* TODO : children */}</div>
      <button>Contacter</button>
    </article>
  );
}
`,
  solution: `function Avatar({ nom }) {
  return <span className="avatar">{nom[0]}</span>;
}

export default function CarteProfil({ nom, role = 'Développeur', children, onContacter }) {
  return (
    <article className="carte">
      <Avatar nom={nom} />
      <h2>{nom}</h2>
      <p className="role">{role}</p>
      <div className="bio">{children}</div>
      <button onClick={() => onContacter(nom)}>Contacter</button>
    </article>
  );
}
`,
  indices: [
    'La déstructuration avec valeur par défaut : `function CarteProfil({ nom, role = \'Développeur\', children, onContacter })`.',
    'La première lettre d\'une chaîne : `nom[0]`.',
    'Pour passer un argument au clic : `onClick={() => onContacter(nom)}`.',
  ],
  tests: [
    {
      nom: 'Affiche le nom reçu en prop',
      aide: 'Affiche `{nom}` dans le `<h2>`.',
      run: async (t) => {
        const w = await t.mount({ nom: 'Ada', onContacter: t.fn() });
        t.expect(w.get('h2').text()).toBe('Ada');
      },
    },
    {
      nom: 'Le rôle vaut « Développeur » par défaut',
      aide: 'Donne une valeur par défaut dans la déstructuration : `role = \'Développeur\'`.',
      run: async (t) => {
        const w = await t.mount({ nom: 'Ada', onContacter: t.fn() });
        t.expect(w.get('p.role').text()).toBe('Développeur');
        await w.setProps({ role: 'Mathématicienne' });
        t.expect(w.get('p.role').text()).toBe('Mathématicienne');
      },
    },
    {
      nom: 'L\'avatar affiche l\'initiale du nom',
      aide: 'Passe le nom au composant : `<Avatar nom={nom} />`, puis affiche `nom[0]`.',
      run: async (t) => {
        const w = await t.mount({ nom: 'Grace', onContacter: t.fn() });
        t.expect(w.get('span.avatar').text()).toBe('G');
      },
    },
    {
      nom: 'Affiche les children dans la bio',
      aide: 'Affiche `{children}` dans `<div className="bio">`.',
      run: async (t) => {
        const w = await t.mount({ nom: 'Ada', onContacter: t.fn(), children: 'Première programmeuse.' });
        t.expect(w.get('.bio').text()).toBe('Première programmeuse.');
      },
    },
    {
      nom: 'Le bouton appelle onContacter avec le nom',
      aide: 'Écris `onClick={() => onContacter(nom)}` sur le bouton.',
      run: async (t) => {
        const onContacter = t.fn();
        const w = await t.mount({ nom: 'Ada', onContacter });
        t.expect(onContacter).not.toHaveBeenCalled();
        await w.findByText('Contacter', 'button').click();
        t.expect(onContacter).toHaveBeenCalledTimes(1);
        t.expect(onContacter).toHaveBeenCalledWith('Ada');
      },
    },
  ],
};
