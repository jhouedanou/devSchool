export default {
  id: '01-premier-composant',
  titre: 'Mon premier composant',
  type: 'react',
  consigne: `Tu vas écrire ta première page en JSX, avec un petit composant.

1. Crée un composant \`Badge\` qui affiche \`<span className="badge">React 19</span>\`.
2. Dans \`App\`, renvoie **un fragment** (\`<>…</>\`) qui contient :
   - un \`<h1>\` avec le texte \`Bonjour Ada\` (utilise la variable \`prenom\` entre accolades) ;
   - un paragraphe \`<p className="intro">\` qui affiche \`Tu as 3 leçons à lire.\` (calcule le nombre avec \`lecons.length\`) ;
   - le composant \`<Badge />\`.
3. N'écris pas \`class\` : en JSX, c'est \`className\`.`,
  depart: `const prenom = 'Ada';
const lecons = ['JSX', 'Props', 'État'];

// TODO : crée le composant Badge

export default function App() {
  // TODO : renvoie un fragment avec le titre, le paragraphe et le badge
  return <h1>Bonjour</h1>;
}
`,
  solution: `const prenom = 'Ada';
const lecons = ['JSX', 'Props', 'État'];

function Badge() {
  return <span className="badge">React 19</span>;
}

export default function App() {
  return (
    <>
      <h1>Bonjour {prenom}</h1>
      <p className="intro">Tu as {lecons.length} leçons à lire.</p>
      <Badge />
    </>
  );
}
`,
  indices: [
    'Une expression JavaScript dans le JSX s\'écrit entre accolades : `{prenom}`.',
    'Un composant est une fonction dont le nom commence par une majuscule. On l\'utilise comme une balise : `<Badge />`.',
    'Le fragment `<>…</>` regroupe plusieurs éléments sans ajouter de `<div>` dans le DOM.',
  ],
  tests: [
    {
      nom: 'Le titre affiche « Bonjour Ada »',
      aide: 'Écris `<h1>Bonjour {prenom}</h1>`.',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.get('h1').text()).toBe('Bonjour Ada');
      },
    },
    {
      nom: 'Le paragraphe a la classe « intro » et compte les leçons',
      aide: 'Utilise `className="intro"` et `{lecons.length}`.',
      run: async (t) => {
        const w = await t.mount();
        const p = w.get('p.intro');
        t.expect(p.text()).toBe('Tu as 3 leçons à lire.');
      },
    },
    {
      nom: 'Le badge est affiché par un composant',
      aide: 'Crée `function Badge() { return <span className="badge">React 19</span>; }` puis écris `<Badge />` dans App.',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.get('span.badge').text()).toBe('React 19');
      },
    },
    {
      nom: 'Pas de <div> autour : un fragment suffit',
      aide: 'Remplace la `<div>` englobante par `<>` et `</>`.',
      run: async (t) => {
        const w = await t.mount();
        const enfants = Array.from(w.element.children).map((e) => e.tagName.toLowerCase());
        t.expect(enfants).toEqual(['h1', 'p', 'span']);
      },
    },
  ],
};
