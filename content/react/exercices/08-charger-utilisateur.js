export default {
  id: '08-charger-utilisateur',
  titre: 'Charger un utilisateur',
  type: 'react',
  consigne: `Charge un utilisateur depuis l'API \`/api/users/:id\` avec \`fetch\` dans un effet.

1. Dans un \`useEffect\` qui dépend de \`userId\`, appelle \`fetch\` sur l'URL \`/api/users/\` suivie de \`userId\` (par exemple \`/api/users/1\`).
2. Pendant le chargement, affiche \`<p className="chargement">Chargement…</p>\`.
3. Si la réponse n'est pas \`ok\`, affiche \`<p className="erreur">Erreur 404</p>\` (avec le vrai code : \`res.status\`).
4. Sinon, affiche le nom dans un \`<h2>\` et l'email dans \`<p className="email">\`.
5. Quand \`userId\` change, recharge. Utilise un drapeau \`ignore\` (mis à \`true\` dans le nettoyage) pour **ignorer la réponse d'une ancienne requête**.`,
  depart: `import { useEffect, useState } from 'react';

export default function Profil({ userId = 1 }) {
  const [user, setUser] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  // TODO : charger /api/users/{userId} dans un effet

  if (chargement) return <p className="chargement">Chargement…</p>;
  if (erreur) return <p className="erreur">{erreur}</p>;
  return (
    <div>
      <h2>{user.nom}</h2>
      <p className="email">{user.email}</p>
    </div>
  );
}
`,
  solution: `import { useEffect, useState } from 'react';

export default function Profil({ userId = 1 }) {
  const [user, setUser] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function charger() {
      setChargement(true);
      setErreur(null);
      try {
        const res = await fetch(\`/api/users/\${userId}\`);
        if (!res.ok) throw new Error(\`Erreur \${res.status}\`);
        const donnees = await res.json();
        if (!ignore) setUser(donnees);
      } catch (e) {
        if (!ignore) setErreur(e.message);
      } finally {
        if (!ignore) setChargement(false);
      }
    }

    charger();
    return () => {
      ignore = true;
    };
  }, [userId]);

  if (chargement) return <p className="chargement">Chargement…</p>;
  if (erreur) return <p className="erreur">{erreur}</p>;
  return (
    <div>
      <h2>{user.nom}</h2>
      <p className="email">{user.email}</p>
    </div>
  );
}
`,
  indices: [
    'Un effet ne peut pas être `async`. Déclare `async function charger() { … }` dans l\'effet, puis appelle `charger()`.',
    '`if (!res.ok) throw new Error(\'Erreur \' + res.status);` envoie vers le `catch`.',
    'Écris `let ignore = false;` au début de l\'effet, `return () => { ignore = true; };` à la fin, et n\'appelle les `set…` que si `!ignore`.',
  ],
  // Données renvoyées par fetch dans l'aperçu (les tests ont leurs propres données).
  apercuFetch: {
    '/api/users/': { nom: 'Ada Lovelace', email: 'ada@exemple.fr' },
  },
  tests: [
    {
      nom: 'Appelle fetch avec /api/users/1',
      aide: 'Appelle `fetch` dans un `useEffect` avec `[userId]` en dépendance.',
      run: async (t) => {
        const appels = t.mockFetch({ '/api/users/1': { nom: 'Ada Lovelace', email: 'ada@exemple.fr' } });
        await t.mount();
        await t.pause(30);
        t.expect(appels.length).toBeGreaterThan(0);
        t.expect(appels[0].url).toContain('/api/users/1');
      },
    },
    {
      nom: 'Affiche « Chargement… » puis l\'utilisateur',
      run: async (t) => {
        t.mockFetch(() => new Promise((ok) => setTimeout(() => ok({ nom: 'Ada Lovelace', email: 'ada@exemple.fr' }), 150)));
        const w = await t.mount();
        t.expect(w.get('.chargement').text()).toBe('Chargement…');
        await t.pause(300);
        t.expect(w.get('h2').text()).toBe('Ada Lovelace');
        t.expect(w.get('.email').text()).toBe('ada@exemple.fr');
        t.expect(w.find('.chargement').exists()).toBe(false);
      },
    },
    {
      nom: 'Affiche le code d\'erreur si la réponse n\'est pas ok',
      aide: 'Teste `res.ok` et lève `new Error(\'Erreur \' + res.status)`.',
      run: async (t) => {
        t.mockFetch(() => t.reponse({ message: 'Introuvable' }, 404));
        const w = await t.mount({ userId: 99 });
        await t.pause(50);
        t.expect(w.get('.erreur').text()).toBe('Erreur 404');
        t.expect(w.find('h2').exists()).toBe(false);
      },
    },
    {
      nom: 'Recharge quand userId change',
      aide: 'Mets `userId` dans le tableau de dépendances de l\'effet.',
      run: async (t) => {
        const appels = t.mockFetch({
          '/api/users/1': { nom: 'Ada Lovelace', email: 'ada@exemple.fr' },
          '/api/users/2': { nom: 'Grace Hopper', email: 'grace@exemple.fr' },
        });
        const w = await t.mount({ userId: 1 });
        await t.pause(50);
        t.expect(w.get('h2').text()).toBe('Ada Lovelace');
        await w.setProps({ userId: 2 });
        await t.pause(50);
        t.expect(w.get('h2').text()).toBe('Grace Hopper');
        t.expect(appels.some((a) => a.url.includes('/api/users/2'))).toBe(true);
      },
    },
    {
      nom: 'Ignore la réponse d\'une ancienne requête',
      aide: 'Sans drapeau `ignore`, la réponse lente de l\'utilisateur 1 écrase celle de l\'utilisateur 2.',
      run: async (t) => {
        t.mockFetch((url) => new Promise((ok) => {
          const lent = url.includes('/api/users/1');
          setTimeout(() => ok(lent
            ? { nom: 'Ada Lovelace', email: 'ada@exemple.fr' }
            : { nom: 'Grace Hopper', email: 'grace@exemple.fr' }), lent ? 300 : 30);
        }));
        const w = await t.mount({ userId: 1 });
        await w.setProps({ userId: 2 });
        await t.pause(150);
        t.expect(w.get('h2').text()).toBe('Grace Hopper');
        await t.pause(300);
        t.expect(w.get('h2').text()).toBe('Grace Hopper');
      },
    },
  ],
};
