export default {
  id: '04-reglages-texte',
  titre: 'Réglages du texte',
  type: 'react',
  consigne: `Tous les réglages sont dans **un seul objet** d'état : \`{ taille: 16, gras: false }\`.

1. « A+ » augmente la taille de 2, sans dépasser **32**.
2. « A- » diminue la taille de 2, sans descendre sous **10**.
3. « Gras » inverse \`gras\`.
4. Ne modifie jamais l'objet : crée une copie avec \`{ ...reglages, … }\` pour garder les autres réglages.
5. L'aperçu utilise \`style={{ fontSize: taille, fontWeight: gras ? 'bold' : 'normal' }}\`.
6. \`<p className="infos">\` affiche par exemple \`16 px · normal\` ou \`18 px · gras\` (état dérivé : calcule-le, ne le stocke pas).`,
  depart: `import { useState } from 'react';

export default function Reglages() {
  const [reglages, setReglages] = useState({ taille: 16, gras: false });

  function agrandir() {
    // TODO : +2, maximum 32
  }

  function reduire() {
    // TODO : -2, minimum 10
  }

  function basculerGras() {
    // TODO
  }

  return (
    <div>
      <button onClick={reduire}>A-</button>
      <button onClick={agrandir}>A+</button>
      <button onClick={basculerGras}>Gras</button>
      <p className="apercu">Bonjour React</p>
      <p className="infos">{/* TODO */}</p>
    </div>
  );
}
`,
  solution: `import { useState } from 'react';

export default function Reglages() {
  const [reglages, setReglages] = useState({ taille: 16, gras: false });

  function agrandir() {
    setReglages({ ...reglages, taille: Math.min(32, reglages.taille + 2) });
  }

  function reduire() {
    setReglages({ ...reglages, taille: Math.max(10, reglages.taille - 2) });
  }

  function basculerGras() {
    setReglages({ ...reglages, gras: !reglages.gras });
  }

  const infos = \`\${reglages.taille} px · \${reglages.gras ? 'gras' : 'normal'}\`;

  return (
    <div>
      <button onClick={reduire}>A-</button>
      <button onClick={agrandir}>A+</button>
      <button onClick={basculerGras}>Gras</button>
      <p
        className="apercu"
        style={{ fontSize: reglages.taille, fontWeight: reglages.gras ? 'bold' : 'normal' }}
      >
        Bonjour React
      </p>
      <p className="infos">{infos}</p>
    </div>
  );
}
`,
  indices: [
    'Copie l\'objet puis remplace une clé : `setReglages({ ...reglages, gras: !reglages.gras })`.',
    '`Math.min(32, taille + 2)` et `Math.max(10, taille - 2)` gèrent les limites.',
    'En JSX, `style` reçoit un objet. Un nombre pour `fontSize` est lu en pixels.',
  ],
  tests: [
    {
      nom: 'Affiche « 16 px · normal » au départ',
      aide: 'Calcule le texte à partir de `reglages.taille` et `reglages.gras`.',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.get('.infos').text()).toBe('16 px · normal');
      },
    },
    {
      nom: '« A+ » agrandit le texte de 2 px',
      aide: 'L\'aperçu doit avoir `style={{ fontSize: reglages.taille }}`.',
      run: async (t) => {
        const w = await t.mount();
        await w.findByText('A+', 'button').click();
        await w.findByText('A+', 'button').click();
        t.expect(w.get('.infos').text()).toBe('20 px · normal');
        t.expect(w.get('.apercu').element.style.fontSize).toBe('20px');
      },
    },
    {
      nom: '« Gras » inverse le gras et garde la taille',
      aide: 'Si la taille devient « undefined », tu as remplacé tout l\'objet : copie-le avec `...reglages`.',
      run: async (t) => {
        const w = await t.mount();
        await w.findByText('A+', 'button').click();
        await w.findByText('Gras', 'button').click();
        t.expect(w.get('.infos').text()).toBe('18 px · gras');
        t.expect(w.get('.apercu').element.style.fontWeight).toBe('bold');
        await w.findByText('Gras', 'button').click();
        t.expect(w.get('.infos').text()).toBe('18 px · normal');
      },
    },
    {
      nom: 'La taille reste entre 10 et 32 px',
      aide: 'Utilise `Math.max(10, …)` et `Math.min(32, …)`.',
      run: async (t) => {
        const w = await t.mount();
        for (let i = 0; i < 5; i++) await w.findByText('A-', 'button').click();
        t.expect(w.get('.infos').text()).toBe('10 px · normal');
        for (let i = 0; i < 15; i++) await w.findByText('A+', 'button').click();
        t.expect(w.get('.infos').text()).toBe('32 px · normal');
      },
    },
  ],
};
