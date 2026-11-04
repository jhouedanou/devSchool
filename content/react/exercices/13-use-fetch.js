export default {
  id: '13-use-fetch',
  titre: 'Hook useFetch',
  type: 'react',
  consigne: `Extrais la logique de chargement dans un hook \`useFetch(url)\`.

1. Exporte \`useFetch(url)\`. Il renvoie un objet \`{ data, loading, error }\`.
   - Au départ : \`data\` vaut \`null\`, \`loading\` vaut \`true\`, \`error\` vaut \`null\`.
   - Succès : \`data\` contient le JSON, \`loading\` vaut \`false\`.
   - Réponse pas \`ok\` : \`error\` vaut \`'Erreur 500'\` (avec le vrai code), \`loading\` vaut \`false\`.
2. Le hook recharge quand \`url\` change (tableau de dépendances) et ignore les anciennes réponses (drapeau \`ignore\`).
3. Le composant \`Articles\` utilise le hook avec l'URL \`/api/articles?categorie=\` suivie de la prop \`categorie\` (\`'react'\` par défaut). Il affiche :
   - \`<p className="chargement">Chargement…</p>\` pendant le chargement ;
   - \`<p className="erreur">\` avec le message en cas d'erreur ;
   - sinon un \`<ul>\` avec un \`<li>\` par article (\`article.titre\`, \`key={article.id}\`).`,
  depart: `import { useEffect, useState } from 'react';

export function useFetch(url) {
  // TODO : trois états (data, loading, error) et un effet qui dépend de url
  return { data: null, loading: true, error: null };
}

export default function Articles({ categorie = 'react' }) {
  const { data, loading, error } = useFetch('/api/articles?categorie=' + categorie);

  if (loading) return <p className="chargement">Chargement…</p>;
  if (error) return <p className="erreur">{error}</p>;
  return (
    <ul>
      {/* TODO : un <li> par article */}
    </ul>
  );
}
`,
  solution: `import { useEffect, useState } from 'react';

export function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Erreur ' + res.status);
        return res.json();
      })
      .then((json) => {
        if (!ignore) setData(json);
      })
      .catch((e) => {
        if (!ignore) setError(e.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [url]);

  return { data, loading, error };
}

export default function Articles({ categorie = 'react' }) {
  const { data, loading, error } = useFetch('/api/articles?categorie=' + categorie);

  if (loading) return <p className="chargement">Chargement…</p>;
  if (error) return <p className="erreur">{error}</p>;
  return (
    <ul>
      {data.map((article) => (
        <li key={article.id}>{article.titre}</li>
      ))}
    </ul>
  );
}
`,
  indices: [
    'Reprends la logique de l\'exercice « Charger un utilisateur », mais dans une fonction `useFetch` qui renvoie `{ data, loading, error }`.',
    'L\'effet dépend de `[url]` : quand la catégorie change, l\'URL change, et le hook recharge.',
    'Pense à `setLoading(true)` au début de l\'effet, pour afficher « Chargement… » à chaque nouvelle URL.',
  ],
  tests: [
    {
      nom: 'useFetch renvoie { data, loading, error }',
      aide: 'Au départ : `{ data: null, loading: true, error: null }`. Après le chargement : `loading: false` et `data` rempli.',
      run: async (t) => {
        t.mockFetch(() => new Promise((ok) => setTimeout(() => ok({ ok: 1 }), 80)));
        const R = t.window.React;
        function Sonde() {
          const r = t.module.useFetch('/api/sonde');
          return R.createElement('pre', null, JSON.stringify(r));
        }
        const w = await t.mount({}, { composant: Sonde });
        t.expect(JSON.parse(w.get('pre').text())).toEqual({ data: null, loading: true, error: null });
        await t.pause(250);
        t.expect(JSON.parse(w.get('pre').text())).toEqual({ data: { ok: 1 }, loading: false, error: null });
      },
    },
    {
      nom: 'Articles affiche « Chargement… » puis la liste',
      run: async (t) => {
        const appels = t.mockFetch(() => new Promise((ok) => setTimeout(() => ok([
          { id: 1, titre: 'Les hooks' },
          { id: 2, titre: 'Le contexte' },
        ]), 80)));
        const w = await t.mount();
        t.expect(w.get('.chargement').text()).toBe('Chargement…');
        await t.pause(250);
        t.expect(w.findAll('li').map((li) => li.text())).toEqual(['Les hooks', 'Le contexte']);
        t.expect(appels[0].url).toContain('/api/articles?categorie=react');
      },
    },
    {
      nom: 'Affiche l\'erreur si la réponse n\'est pas ok',
      aide: 'Dans le hook : `if (!res.ok) throw new Error(\'Erreur \' + res.status);`.',
      run: async (t) => {
        t.mockFetch(() => t.reponse({ message: 'Panne' }, 500));
        const w = await t.mount();
        await t.pause(80);
        t.expect(w.get('.erreur').text()).toBe('Erreur 500');
        t.expect(w.findAll('li')).toHaveLength(0);
      },
    },
    {
      nom: 'Recharge quand la catégorie change',
      aide: 'L\'effet du hook doit dépendre de `[url]`.',
      run: async (t) => {
        const appels = t.mockFetch((url) => (url.includes('categorie=vue')
          ? [{ id: 3, titre: 'Composition API' }]
          : [{ id: 1, titre: 'Les hooks' }]));
        const w = await t.mount();
        await t.pause(60);
        t.expect(w.findAll('li').map((li) => li.text())).toEqual(['Les hooks']);
        await w.setProps({ categorie: 'vue' });
        await t.pause(60);
        t.expect(w.findAll('li').map((li) => li.text())).toEqual(['Composition API']);
        t.expect(appels.some((a) => a.url.includes('categorie=vue'))).toBe(true);
      },
    },
    {
      nom: 'Ignore la réponse d\'une ancienne URL',
      aide: 'Ajoute un drapeau `ignore` dans l\'effet, mis à `true` dans le nettoyage.',
      run: async (t) => {
        t.mockFetch((url) => new Promise((ok) => {
          const lent = url.includes('categorie=react');
          setTimeout(() => ok(lent ? [{ id: 1, titre: 'Les hooks' }] : [{ id: 3, titre: 'Composition API' }]), lent ? 300 : 30);
        }));
        const w = await t.mount();
        await w.setProps({ categorie: 'vue' });
        await t.pause(150);
        t.expect(w.findAll('li').map((li) => li.text())).toEqual(['Composition API']);
        await t.pause(300);
        t.expect(w.findAll('li').map((li) => li.text())).toEqual(['Composition API']);
      },
    },
  ],
};
