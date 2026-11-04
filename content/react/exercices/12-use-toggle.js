export default {
  id: '12-use-toggle',
  titre: 'Hook useToggle',
  type: 'react',
  consigne: `Écris ton premier hook personnalisé.

1. Exporte une fonction \`useToggle(initial = false)\`.
2. Elle utilise \`useState\` et renvoie un tableau \`[valeur, basculer]\`. \`basculer()\` inverse la valeur.
3. Dans \`App\`, utilise **deux fois** le hook :
   - \`[ouvert, basculerOuvert] = useToggle()\` : le bouton \`.question\` affiche ou cache \`<p className="reponse">\` ;
   - \`[sombre, basculerSombre] = useToggle(true)\` : le bouton \`.mode\` affiche \`Mode sombre : oui\` ou \`Mode sombre : non\`.
4. Les deux valeurs sont indépendantes : chaque appel du hook a son propre état.`,
  depart: `import { useState } from 'react';

export function useToggle(initial = false) {
  // TODO : un état + une fonction basculer
  return [initial, () => {}];
}

export default function App() {
  // TODO : utiliser useToggle deux fois
  const ouvert = false;
  const sombre = true;

  return (
    <div>
      <button className="question">Qu'est-ce qu'un hook ?</button>
      {ouvert && <p className="reponse">Une fonction qui commence par « use » et appelle d'autres hooks.</p>}
      <button className="mode">Mode sombre : {sombre ? 'oui' : 'non'}</button>
    </div>
  );
}
`,
  solution: `import { useState } from 'react';

export function useToggle(initial = false) {
  const [valeur, setValeur] = useState(initial);
  const basculer = () => setValeur((v) => !v);
  return [valeur, basculer];
}

export default function App() {
  const [ouvert, basculerOuvert] = useToggle();
  const [sombre, basculerSombre] = useToggle(true);

  return (
    <div>
      <button className="question" onClick={basculerOuvert}>Qu'est-ce qu'un hook ?</button>
      {ouvert && <p className="reponse">Une fonction qui commence par « use » et appelle d'autres hooks.</p>}
      <button className="mode" onClick={basculerSombre}>Mode sombre : {sombre ? 'oui' : 'non'}</button>
    </div>
  );
}
`,
  indices: [
    'Le hook ressemble à un mini-composant sans JSX : `const [valeur, setValeur] = useState(initial);`.',
    '`const basculer = () => setValeur((v) => !v);` puis `return [valeur, basculer];`.',
  ],
  tests: [
    {
      nom: 'useToggle fonctionne seul (valeur par défaut false)',
      aide: 'Renvoie `[valeur, basculer]`, avec `useState(initial)` dedans.',
      run: async (t) => {
        const R = t.window.React;
        function Sonde() {
          const [valeur, basculer] = t.module.useToggle();
          return R.createElement('button', { onClick: basculer }, valeur ? 'vrai' : 'faux');
        }
        const w = await t.mount({}, { composant: Sonde });
        t.expect(w.get('button').text()).toBe('faux');
        await w.get('button').click();
        t.expect(w.get('button').text()).toBe('vrai');
        await w.get('button').click();
        t.expect(w.get('button').text()).toBe('faux');
      },
    },
    {
      nom: 'useToggle accepte une valeur initiale',
      run: async (t) => {
        const R = t.window.React;
        function Sonde() {
          const [valeur, basculer] = t.module.useToggle(true);
          return R.createElement('button', { onClick: basculer }, valeur ? 'vrai' : 'faux');
        }
        const w = await t.mount({}, { composant: Sonde });
        t.expect(w.get('button').text()).toBe('vrai');
        await w.get('button').click();
        t.expect(w.get('button').text()).toBe('faux');
      },
    },
    {
      nom: 'La question affiche puis cache la réponse',
      aide: 'Utilise `const [ouvert, basculerOuvert] = useToggle();` et `onClick={basculerOuvert}`.',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.find('.reponse').exists()).toBe(false);
        await w.get('.question').click();
        t.expect(w.find('.reponse').exists()).toBe(true);
        await w.get('.question').click();
        t.expect(w.find('.reponse').exists()).toBe(false);
      },
    },
    {
      nom: 'Le mode sombre démarre à « oui » et reste indépendant',
      aide: 'Deuxième appel : `useToggle(true)`, avec son propre bouton.',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.get('.mode').text()).toBe('Mode sombre : oui');
        await w.get('.question').click();
        t.expect(w.get('.mode').text()).toBe('Mode sombre : oui');
        await w.get('.mode').click();
        t.expect(w.get('.mode').text()).toBe('Mode sombre : non');
        t.expect(w.find('.reponse').exists()).toBe(true);
      },
    },
  ],
};
