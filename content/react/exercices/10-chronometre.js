export default {
  id: '10-chronometre',
  titre: 'Chronomètre',
  type: 'react',
  consigne: `Construis un chronomètre au dixième de seconde avec \`useRef\`.

1. L'état \`dixiemes\` compte les dixièmes. L'affichage est \`(dixiemes / 10).toFixed(1) + ' s'\`, par exemple \`0.0 s\`.
2. « Démarrer » lance \`setInterval\` toutes les **100 ms**. Garde l'id de l'intervalle dans une **ref** (\`intervalRef.current\`), pas dans l'état. Utilise la mise à jour fonctionnelle : \`setDixiemes((d) => d + 1)\`.
3. Cliquer deux fois sur « Démarrer » ne doit pas lancer deux intervalles.
4. « Arrêter » appelle \`clearInterval\` et remet la ref à \`null\`.
5. « Réinitialiser » arrête, remet à 0, puis **donne le focus** au bouton « Démarrer » grâce à une deuxième ref (\`demarrerRef.current.focus()\`).
6. Quand le composant disparaît, l'intervalle est arrêté (un \`useEffect\` avec nettoyage).`,
  depart: `import { useEffect, useRef, useState } from 'react';

export default function Chronometre() {
  const [dixiemes, setDixiemes] = useState(0);
  // TODO : une ref pour l'id de l'intervalle, une ref pour le bouton Démarrer

  function demarrer() {
    // TODO
  }

  function arreter() {
    // TODO
  }

  function reinitialiser() {
    // TODO
  }

  // TODO : arrêter l'intervalle au démontage

  return (
    <div>
      <p className="temps">{(dixiemes / 10).toFixed(1)} s</p>
      <button onClick={demarrer}>Démarrer</button>
      <button onClick={arreter}>Arrêter</button>
      <button onClick={reinitialiser}>Réinitialiser</button>
    </div>
  );
}
`,
  solution: `import { useEffect, useRef, useState } from 'react';

export default function Chronometre() {
  const [dixiemes, setDixiemes] = useState(0);
  const intervalRef = useRef(null);
  const demarrerRef = useRef(null);

  function demarrer() {
    if (intervalRef.current !== null) return;
    intervalRef.current = setInterval(() => {
      setDixiemes((d) => d + 1);
    }, 100);
  }

  function arreter() {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  function reinitialiser() {
    arreter();
    setDixiemes(0);
    demarrerRef.current.focus();
  }

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div>
      <p className="temps">{(dixiemes / 10).toFixed(1)} s</p>
      <button ref={demarrerRef} onClick={demarrer}>Démarrer</button>
      <button onClick={arreter}>Arrêter</button>
      <button onClick={reinitialiser}>Réinitialiser</button>
    </div>
  );
}
`,
  indices: [
    '`const intervalRef = useRef(null);` puis `intervalRef.current = setInterval(…, 100);`.',
    'Dans `demarrer`, sors tout de suite si `intervalRef.current !== null` : un intervalle tourne déjà.',
    'Avec `setDixiemes(dixiemes + 1)` dans l\'intervalle, la fonction garde l\'ancienne valeur de `dixiemes` : le temps reste bloqué à 0.1. Utilise `setDixiemes((d) => d + 1)`.',
  ],
  tests: [
    {
      nom: 'Affiche « 0.0 s » au départ',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.get('.temps').text()).toBe('0.0 s');
      },
    },
    {
      nom: '« Démarrer » fait avancer le temps',
      aide: 'Lance `setInterval` toutes les 100 ms avec `setDixiemes((d) => d + 1)`.',
      run: async (t) => {
        const w = await t.mount();
        await w.findByText('Démarrer', 'button').click();
        await t.pause(450);
        await w.findByText('Arrêter', 'button').click();
        const secondes = parseFloat(w.get('.temps').text());
        t.expect(secondes).toBeGreaterThanOrEqual(0.3);
        t.expect(secondes).toBeLessThanOrEqual(0.6);
      },
    },
    {
      nom: '« Arrêter » fige le temps',
      aide: 'Appelle `clearInterval(intervalRef.current)`.',
      run: async (t) => {
        const w = await t.mount();
        await w.findByText('Démarrer', 'button').click();
        await t.pause(250);
        await w.findByText('Arrêter', 'button').click();
        const avant = w.get('.temps').text();
        await t.pause(300);
        t.expect(w.get('.temps').text()).toBe(avant);
      },
    },
    {
      nom: 'Deux clics sur « Démarrer » ne vont pas plus vite',
      aide: 'Si `intervalRef.current` n\'est pas `null`, ne relance pas d\'intervalle.',
      run: async (t) => {
        const w = await t.mount();
        await w.findByText('Démarrer', 'button').click();
        await w.findByText('Démarrer', 'button').click();
        await t.pause(450);
        await w.findByText('Arrêter', 'button').click();
        t.expect(parseFloat(w.get('.temps').text())).toBeLessThanOrEqual(0.6);
        await t.pause(250);
        t.expect(parseFloat(w.get('.temps').text())).toBeLessThanOrEqual(0.6);
      },
    },
    {
      nom: '« Réinitialiser » remet à 0 et donne le focus à « Démarrer »',
      aide: 'Ajoute `ref={demarrerRef}` sur le bouton, puis `demarrerRef.current.focus()`.',
      run: async (t) => {
        const w = await t.mount();
        await w.findByText('Démarrer', 'button').click();
        await t.pause(250);
        await w.findByText('Réinitialiser', 'button').click();
        t.expect(w.get('.temps').text()).toBe('0.0 s');
        const actif = t.document.activeElement;
        t.expect(actif && actif.tagName === 'BUTTON' ? actif.textContent : '(aucun bouton n\'a le focus)').toBe('Démarrer');
        await t.pause(250);
        t.expect(w.get('.temps').text()).toBe('0.0 s');
      },
    },
    {
      nom: 'L\'intervalle est arrêté au démontage',
      aide: 'Ajoute `useEffect(() => () => clearInterval(intervalRef.current), []);`.',
      run: async (t) => {
        const w = await t.mount();
        await w.findByText('Démarrer', 'button').click();
        const original = t.window.clearInterval;
        const espion = t.fn();
        t.window.clearInterval = function (id) {
          espion(id);
          return original.call(t.window, id);
        };
        try {
          await w.unmount();
        } finally {
          t.window.clearInterval = original;
        }
        t.expect(espion).toHaveBeenCalled();
      },
    },
  ],
};
