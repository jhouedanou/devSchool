export default {
  id: '02-mini-ref',
  titre: 'Comprendre .value : un mini ref()',
  type: 'js',
  consigne: `Pourquoi faut-il écrire \`.value\` ? Parce qu'une ref est un objet avec un **getter** (lecture) et un **setter** (écriture). Le setter prévient Vue que la valeur a changé.

Écris une version très simple de ce mécanisme (sans Vue).

1. \`creerRef(initiale)\` retourne un objet avec une propriété \`value\`.
2. Le **getter** \`get value()\` retourne la valeur actuelle.
3. Le **setter** \`set value(nouvelle)\` :
   - ne fait rien si la valeur ne change pas (compare avec \`Object.is\`) ;
   - sinon, change la valeur, puis appelle chaque abonné avec \`(nouvelle, ancienne)\`.
4. La méthode \`abonner(fn)\` ajoute \`fn\` aux abonnés et retourne une fonction qui le **désabonne**.

\`\`\`js
const age = creerRef(30)
const stop = age.abonner((n, a) => console.log(a, '→', n))
age.value = 31   // affiche 30 → 31
stop()
age.value = 32   // n'affiche rien
\`\`\``,
  depart: `export function creerRef(initiale) {
  let valeur = initiale
  const abonnes = []

  return {
    get value() {
      // TODO 1 : retourne la valeur actuelle
    },
    set value(nouvelle) {
      // TODO 2 : si la valeur ne change pas (Object.is), arrête-toi
      // TODO 3 : garde l'ancienne valeur, change la valeur,
      //          puis appelle chaque abonné avec (nouvelle, ancienne)
    },
    abonner(fn) {
      // TODO 4 : ajoute fn aux abonnés
      // et retourne une fonction qui retire fn des abonnés
    },
  }
}
`,
  solution: `export function creerRef(initiale) {
  let valeur = initiale
  const abonnes = []

  return {
    get value() {
      return valeur
    },
    set value(nouvelle) {
      if (Object.is(nouvelle, valeur)) return
      const ancienne = valeur
      valeur = nouvelle
      abonnes.forEach((fn) => fn(nouvelle, ancienne))
    },
    abonner(fn) {
      abonnes.push(fn)
      return () => {
        const index = abonnes.indexOf(fn)
        if (index !== -1) abonnes.splice(index, 1)
      }
    },
  }
}
`,
  indices: [
    'Le getter : get value() { return valeur }.',
    'Dans le setter, garde l\'ancienne valeur dans une constante AVANT de modifier valeur.',
    'Pour désabonner : cherche fn avec indexOf, puis retire-la avec splice.',
  ],
  tests: [
    {
      nom: 'value retourne la valeur initiale',
      run: async (t) => {
        const r = t.module.creerRef(30);
        t.expect(r.value).toBe(30);
      },
    },
    {
      nom: 'value peut être modifiée',
      run: async (t) => {
        const r = t.module.creerRef('a');
        r.value = 'b';
        t.expect(r.value).toBe('b');
      },
    },
    {
      nom: 'Les abonnés reçoivent (nouvelle, ancienne)',
      run: async (t) => {
        const r = t.module.creerRef(1);
        const espion = t.fn();
        r.abonner(espion);
        r.value = 2;
        t.expect(espion).toHaveBeenCalledTimes(1);
        t.expect(espion).toHaveBeenCalledWith(2, 1);
      },
    },
    {
      nom: "Aucun appel si la valeur ne change pas",
      aide: 'Compare avec Object.is(nouvelle, valeur) et sors du setter si c\'est la même valeur.',
      run: async (t) => {
        const r = t.module.creerRef(5);
        const espion = t.fn();
        r.abonner(espion);
        r.value = 5;
        t.expect(espion).not.toHaveBeenCalled();
      },
    },
    {
      nom: 'La fonction retournée par abonner() désabonne',
      run: async (t) => {
        const r = t.module.creerRef(0);
        const a = t.fn();
        const b = t.fn();
        const stopA = r.abonner(a);
        r.abonner(b);
        t.expect(stopA).toBeTypeOf('function');
        stopA();
        r.value = 1;
        t.expect(a).not.toHaveBeenCalled();
        t.expect(b).toHaveBeenCalledWith(1, 0);
      },
    },
  ],
};
