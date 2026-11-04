export default {
  id: '07-titre-onglet',
  titre: 'Titre de l\'onglet',
  type: 'react',
  consigne: `Synchronise ce composant avec deux choses extérieures à React : le titre de l'onglet et le clavier.

1. Avec un \`useEffect\`, mets \`document.title\` à \`Compteur : 0\`, puis à jour à chaque changement de \`compte\`. Pense au tableau de dépendances.
2. Avec un deuxième \`useEffect\` (tableau vide), écoute l'événement \`keydown\` sur \`window\`. Quand une touche est pressée, garde \`e.key\` dans l'état \`touche\`.
3. Affiche \`Dernière touche : aucune\` au départ, puis par exemple \`Dernière touche : a\`.
4. **Nettoie** l'écouteur : l'effet renvoie une fonction qui appelle \`window.removeEventListener\`.`,
  depart: `import { useEffect, useState } from 'react';

export default function App() {
  const [compte, setCompte] = useState(0);
  const [touche, setTouche] = useState(null);

  // TODO : effet 1 → document.title

  // TODO : effet 2 → écouter keydown sur window (et nettoyer)

  return (
    <div>
      <button onClick={() => setCompte(compte + 1)}>+1</button>
      <p className="compte">{compte}</p>
      <p className="touche">Dernière touche : {/* TODO */}</p>
    </div>
  );
}
`,
  solution: `import { useEffect, useState } from 'react';

export default function App() {
  const [compte, setCompte] = useState(0);
  const [touche, setTouche] = useState(null);

  useEffect(() => {
    document.title = \`Compteur : \${compte}\`;
  }, [compte]);

  useEffect(() => {
    function handleKeyDown(e) {
      setTouche(e.key);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div>
      <button onClick={() => setCompte(compte + 1)}>+1</button>
      <p className="compte">{compte}</p>
      <p className="touche">Dernière touche : {touche ?? 'aucune'}</p>
    </div>
  );
}
`,
  indices: [
    '`useEffect(() => { document.title = …; }, [compte]);`',
    'Déclare la fonction d\'écoute DANS l\'effet, pour pouvoir passer la même fonction à `addEventListener` et à `removeEventListener`.',
    'L\'effet du clavier renvoie `() => window.removeEventListener(\'keydown\', handleKeyDown)`.',
  ],
  tests: [
    {
      nom: 'Le titre vaut « Compteur : 0 » au montage',
      aide: 'Écris `document.title = …` dans un `useEffect`.',
      run: async (t) => {
        t.document.title = '';
        await t.mount();
        t.expect(t.document.title).toBe('Compteur : 0');
      },
    },
    {
      nom: 'Le titre suit le compteur',
      aide: 'Ajoute `compte` dans le tableau de dépendances : `[compte]`.',
      run: async (t) => {
        const w = await t.mount();
        await w.findByText('+1', 'button').click();
        await w.findByText('+1', 'button').click();
        t.expect(w.get('.compte').text()).toBe('2');
        t.expect(t.document.title).toBe('Compteur : 2');
      },
    },
    {
      nom: 'Affiche « aucune » puis la dernière touche pressée',
      aide: 'Écoute `keydown` sur `window` et garde `e.key` dans l\'état.',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.get('.touche').text()).toBe('Dernière touche : aucune');
        await w.get('.touche').trigger('keydown', { key: 'a' });
        t.expect(w.get('.touche').text()).toBe('Dernière touche : a');
        await w.get('.touche').trigger('keydown', { key: 'Enter' });
        t.expect(w.get('.touche').text()).toBe('Dernière touche : Enter');
      },
    },
    {
      nom: 'L\'écouteur est retiré quand le composant disparaît',
      aide: 'L\'effet doit renvoyer une fonction de nettoyage qui appelle `window.removeEventListener(\'keydown\', …)`.',
      run: async (t) => {
        const w = await t.mount();
        const original = t.window.removeEventListener;
        const espion = t.fn();
        t.window.removeEventListener = function (...args) {
          espion(args[0]);
          return original.apply(this, args);
        };
        try {
          await w.unmount();
        } finally {
          t.window.removeEventListener = original;
        }
        t.expect(espion).toHaveBeenCalledWith('keydown');
      },
    },
  ],
};
