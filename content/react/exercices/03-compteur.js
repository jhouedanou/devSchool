export default {
  id: '03-compteur',
  titre: 'Un compteur',
  type: 'react',
  consigne: `Rends ce compteur interactif avec \`useState\`.

1. Crée un état \`compte\` qui démarre à la prop \`initial\` (\`0\` par défaut).
2. Affiche-le dans \`<p className="valeur">\`.
3. « +1 » ajoute 1 et « -1 » enlève 1. Le bouton « -1 » est **désactivé** (\`disabled\`) quand le compte vaut 0.
4. « +3 » ajoute 3 en appelant **trois fois** \`setCompte\` avec une mise à jour fonctionnelle : \`setCompte((c) => c + 1)\`.
5. « Remise à zéro » remet le compte à 0.`,
  depart: `import { useState } from 'react';

export default function Compteur({ initial = 0 }) {
  // TODO : créer l'état compte

  return (
    <div>
      <p className="valeur">0</p>
      <button>-1</button>
      <button>+1</button>
      <button>+3</button>
      <button>Remise à zéro</button>
    </div>
  );
}
`,
  solution: `import { useState } from 'react';

export default function Compteur({ initial = 0 }) {
  const [compte, setCompte] = useState(initial);

  function ajouterTrois() {
    setCompte((c) => c + 1);
    setCompte((c) => c + 1);
    setCompte((c) => c + 1);
  }

  return (
    <div>
      <p className="valeur">{compte}</p>
      <button onClick={() => setCompte(compte - 1)} disabled={compte === 0}>-1</button>
      <button onClick={() => setCompte(compte + 1)}>+1</button>
      <button onClick={ajouterTrois}>+3</button>
      <button onClick={() => setCompte(0)}>Remise à zéro</button>
    </div>
  );
}
`,
  indices: [
    '`const [compte, setCompte] = useState(initial);`',
    'Un bouton se désactive avec `disabled={compte === 0}`.',
    'Avec `setCompte(compte + 1)` écrit trois fois, `compte` ne change pas entre les appels : tu n\'ajoutes que 1. La forme `setCompte((c) => c + 1)` part toujours de la dernière valeur.',
  ],
  tests: [
    {
      nom: 'Affiche 0 au départ',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.get('.valeur').text()).toBe('0');
      },
    },
    {
      nom: 'Démarre à la prop initial',
      aide: 'Passe la prop à useState : `useState(initial)`.',
      run: async (t) => {
        const w = await t.mount({ initial: 5 });
        t.expect(w.get('.valeur').text()).toBe('5');
      },
    },
    {
      nom: '« +1 » ajoute 1 à chaque clic',
      run: async (t) => {
        const w = await t.mount();
        const plus = w.findByText('+1', 'button');
        await plus.click();
        await plus.click();
        await plus.click();
        t.expect(w.get('.valeur').text()).toBe('3');
      },
    },
    {
      nom: '« -1 » enlève 1 et se désactive à 0',
      aide: 'Ajoute `disabled={compte === 0}` sur le bouton « -1 ».',
      run: async (t) => {
        const w = await t.mount({ initial: 2 });
        const moins = w.findByText('-1', 'button');
        t.expect(moins.disabled).toBe(false);
        await moins.click();
        t.expect(w.get('.valeur').text()).toBe('1');
        await moins.click();
        t.expect(w.get('.valeur').text()).toBe('0');
        t.expect(w.findByText('-1', 'button').disabled).toBe(true);
      },
    },
    {
      nom: '« +3 » ajoute 3',
      aide: 'Utilise la mise à jour fonctionnelle : `setCompte((c) => c + 1)` trois fois.',
      run: async (t) => {
        const w = await t.mount();
        await w.findByText('+3', 'button').click();
        t.expect(w.get('.valeur').text()).toBe('3');
        await w.findByText('+3', 'button').click();
        t.expect(w.get('.valeur').text()).toBe('6');
      },
    },
    {
      nom: '« Remise à zéro » remet le compte à 0',
      run: async (t) => {
        const w = await t.mount({ initial: 4 });
        await w.findByText('+1', 'button').click();
        await w.findByText('Remise à zéro', 'button').click();
        t.expect(w.get('.valeur').text()).toBe('0');
      },
    },
  ],
};
