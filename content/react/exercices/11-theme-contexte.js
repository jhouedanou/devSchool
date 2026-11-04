export default {
  id: '11-theme-contexte',
  titre: 'Thème avec un contexte',
  type: 'react',
  consigne: `Partage le thème (\`'clair'\` ou \`'sombre'\`) avec un **contexte**, sans passer de props à \`Entete\`.

1. Crée le contexte : \`const ThemeContext = createContext(null);\`.
2. Dans \`App\`, garde le thème dans l'état (valeur de départ : la prop \`themeInitial\`, \`'clair'\` par défaut) et écris une fonction \`basculer\`.
3. Enveloppe le contenu avec \`<ThemeContext.Provider value={{ theme, basculer }}>\`.
4. \`Titre\` lit le thème avec \`useContext\` : \`<h1 className={'titre ' + theme}>\`.
5. \`BoutonTheme\` lit \`theme\` et \`basculer\`. Son texte est \`Passer en sombre\` quand le thème est clair, et \`Passer en clair\` sinon.
6. La \`<div className="page …">\` prend aussi la classe du thème.

> En React 19, tu pourrais écrire \`<ThemeContext value={…}>\`. L'exercice tourne en React 18.3 : garde \`.Provider\`.`,
  depart: `import { createContext, useContext, useState } from 'react';

// TODO : créer ThemeContext

function Titre() {
  // TODO : lire le thème
  const theme = 'clair';
  return <h1 className={'titre ' + theme}>Mon site</h1>;
}

function BoutonTheme() {
  // TODO : lire theme et basculer
  return <button className="bouton-theme">Passer en sombre</button>;
}

function Entete() {
  // Entete ne reçoit aucune prop : c'est le but du contexte.
  return (
    <header>
      <Titre />
      <BoutonTheme />
    </header>
  );
}

export default function App({ themeInitial = 'clair' }) {
  // TODO : état du thème + fonction basculer + Provider
  return (
    <div className="page clair">
      <Entete />
    </div>
  );
}
`,
  solution: `import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(null);

function Titre() {
  const { theme } = useContext(ThemeContext);
  return <h1 className={'titre ' + theme}>Mon site</h1>;
}

function BoutonTheme() {
  const { theme, basculer } = useContext(ThemeContext);
  return (
    <button className="bouton-theme" onClick={basculer}>
      Passer en {theme === 'clair' ? 'sombre' : 'clair'}
    </button>
  );
}

function Entete() {
  return (
    <header>
      <Titre />
      <BoutonTheme />
    </header>
  );
}

export default function App({ themeInitial = 'clair' }) {
  const [theme, setTheme] = useState(themeInitial);
  const basculer = () => setTheme((t) => (t === 'clair' ? 'sombre' : 'clair'));

  return (
    <ThemeContext.Provider value={{ theme, basculer }}>
      <div className={'page ' + theme}>
        <Entete />
      </div>
    </ThemeContext.Provider>
  );
}
`,
  indices: [
    '`const { theme, basculer } = useContext(ThemeContext);` dans les composants qui en ont besoin.',
    'Le Provider doit être **au-dessus** des composants qui lisent le contexte : mets-le autour de la `<div className="page">`.',
    '`basculer` : `setTheme((t) => (t === \'clair\' ? \'sombre\' : \'clair\'))`.',
  ],
  tests: [
    {
      nom: 'Le titre a la classe du thème clair au départ',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.get('h1').classes('clair')).toBe(true);
        t.expect(w.get('.page').classes('clair')).toBe(true);
      },
    },
    {
      nom: 'Le bouton bascule le thème de toute la page',
      aide: 'Le bouton appelle `basculer`, lu dans le contexte.',
      run: async (t) => {
        const w = await t.mount();
        await w.get('.bouton-theme').click();
        t.expect(w.get('h1').classes('sombre')).toBe(true);
        t.expect(w.get('h1').classes('clair')).toBe(false);
        t.expect(w.get('.page').classes('sombre')).toBe(true);
      },
    },
    {
      nom: 'Le texte du bouton suit le thème',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.get('.bouton-theme').text()).toBe('Passer en sombre');
        await w.get('.bouton-theme').click();
        t.expect(w.get('.bouton-theme').text()).toBe('Passer en clair');
        await w.get('.bouton-theme').click();
        t.expect(w.get('.bouton-theme').text()).toBe('Passer en sombre');
        t.expect(w.get('h1').classes('clair')).toBe(true);
      },
    },
    {
      nom: 'Démarre avec la prop themeInitial',
      aide: 'Passe la prop à l\'état : `useState(themeInitial)`.',
      run: async (t) => {
        const w = await t.mount({ themeInitial: 'sombre' });
        t.expect(w.get('h1').classes('sombre')).toBe(true);
        t.expect(w.get('.bouton-theme').text()).toBe('Passer en clair');
      },
    },
  ],
};
