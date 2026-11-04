export default {
  id: '03-nom-composant',
  titre: 'Deviner le nom d\'un composant',
  type: 'js',
  consigne: `Nuxt donne un nom à chaque composant de \`app/components/\` d'après son chemin. Écris \`nomComposant(chemin)\`, qui applique ces règles. \`chemin\` est relatif à \`app/components/\`.

1. Enlève l'extension \`.vue\` et le suffixe \`.client\` ou \`.server\`.
2. Ignore les dossiers entre parenthèses, comme \`(formulaires)/\`.
3. Mets chaque morceau en PascalCase : \`app-header\` → \`AppHeader\`, \`base\` → \`Base\`.
4. Colle les dossiers puis le fichier : \`base/foo/Button.vue\` → \`BaseFooButton\`.
5. Pas de répétition : si le nom du fichier commence déjà par le ou les derniers dossiers, ne les répète pas. \`base/BaseButton.vue\` → \`BaseButton\` et \`base/foo/FooButton.vue\` → \`BaseFooButton\`.

> Exercice en JavaScript pur. Il reproduit, en simplifié, la règle que Nuxt applique quand il importe tes composants.`,
  depart: `// Transforme « app-header » en « AppHeader ».
function enPascal(mot) {
  // TODO
  return mot
}

export function nomComposant(chemin) {
  // TODO : applique les 5 règles de la consigne.
  return chemin
}
`,
  solution: `// Transforme « app-header » en « AppHeader ».
function enPascal(mot) {
  return mot
    .split(/[-_]/)
    .filter(Boolean)
    .map((m) => m[0].toUpperCase() + m.slice(1))
    .join('')
}

export function nomComposant(chemin) {
  const morceaux = chemin
    .replace(/\\.vue$/, '')
    .replace(/\\.(client|server)$/, '')
    .split('/')
    .filter((m) => !/^\\(.*\\)$/.test(m))
    .map(enPascal)
  const fichier = morceaux.pop()
  const dossiers = morceaux

  // On cherche la plus longue fin des dossiers déjà présente au début du fichier.
  for (let i = 0; i < dossiers.length; i++) {
    const fin = dossiers.slice(i).join('')
    if (fichier.startsWith(fin)) {
      return dossiers.slice(0, i).join('') + fichier
    }
  }
  return dossiers.join('') + fichier
}
`,
  indices: [
    'Découpe le chemin avec split(\'/\'), puis retire le dernier morceau avec pop() : c\'est le fichier.',
    'Pour enPascal : split(\'-\'), puis mets la première lettre de chaque mot en majuscule.',
    'Règle 5 : teste d\'abord tous les dossiers collés, puis sans le premier, etc. Utilise startsWith().',
  ],
  tests: [
    {
      nom: 'Fichier à la racine de components/',
      run: async (t) => {
        t.expect(t.module.nomComposant('AppHeader.vue')).toBe('AppHeader');
        t.expect(t.module.nomComposant('app-header.vue')).toBe('AppHeader');
      },
    },
    {
      nom: 'Dossiers imbriqués',
      run: async (t) => {
        t.expect(t.module.nomComposant('base/foo/Button.vue')).toBe('BaseFooButton');
        t.expect(t.module.nomComposant('ui/card-list/Item.vue')).toBe('UiCardListItem');
      },
    },
    {
      nom: 'Pas de morceau répété',
      aide: 'Si le fichier commence déjà par la fin des dossiers, garde le fichier tel quel.',
      run: async (t) => {
        t.expect(t.module.nomComposant('base/BaseButton.vue')).toBe('BaseButton');
        t.expect(t.module.nomComposant('base/foo/FooButton.vue')).toBe('BaseFooButton');
      },
    },
    {
      nom: 'Suffixes .client et .server ignorés',
      run: async (t) => {
        t.expect(t.module.nomComposant('Comments.client.vue')).toBe('Comments');
        t.expect(t.module.nomComposant('stats/Graph.server.vue')).toBe('StatsGraph');
      },
    },
    {
      nom: 'Dossiers de groupe entre parenthèses ignorés',
      run: async (t) => {
        t.expect(t.module.nomComposant('base/(foo)/Button.vue')).toBe('BaseButton');
        t.expect(t.module.nomComposant('(formulaires)/Champ.vue')).toBe('Champ');
      },
    },
  ],
};
