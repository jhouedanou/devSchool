export default {
  id: '05-liste-filtree',
  titre: 'Liste filtrée',
  type: 'react',
  consigne: `Affiche un catalogue de produits avec une recherche.

1. Affiche un \`<li>\` par produit avec \`map\`. Chaque \`<li>\` a une \`key\` : utilise \`produit.id\`, pas l'index.
2. Le texte d'un \`<li>\` est \`Souris – 25 €\` (nom, tiret, prix).
3. Si le stock vaut 0, ajoute \`<span className="rupture">Rupture</span>\` dans le \`<li>\`. Attention au piège du \`0 &&\`.
4. Le champ de recherche filtre par nom, **sans tenir compte des majuscules**.
5. \`<p className="compteur">\` affiche \`4 produits\`, ou \`1 produit\` au singulier.
6. S'il n'y a aucun résultat, n'affiche pas la liste mais \`<p className="vide">Aucun produit trouvé</p>\`.`,
  depart: `import { useState } from 'react';

const PRODUITS = [
  { id: 'p1', nom: 'Clavier', prix: 49, stock: 0 },
  { id: 'p2', nom: 'Souris', prix: 25, stock: 12 },
  { id: 'p3', nom: 'Écran', prix: 199, stock: 3 },
  { id: 'p4', nom: 'Casque', prix: 79, stock: 5 },
];

export default function Catalogue({ produits = PRODUITS }) {
  const [recherche, setRecherche] = useState('');

  // TODO : calculer la liste filtrée (état dérivé)

  return (
    <div>
      <input
        className="recherche"
        placeholder="Rechercher…"
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
      />
      <p className="compteur">{/* TODO */}</p>
      <ul>
        {/* TODO : un <li> par produit */}
      </ul>
    </div>
  );
}
`,
  solution: `import { useState } from 'react';

const PRODUITS = [
  { id: 'p1', nom: 'Clavier', prix: 49, stock: 0 },
  { id: 'p2', nom: 'Souris', prix: 25, stock: 12 },
  { id: 'p3', nom: 'Écran', prix: 199, stock: 3 },
  { id: 'p4', nom: 'Casque', prix: 79, stock: 5 },
];

export default function Catalogue({ produits = PRODUITS }) {
  const [recherche, setRecherche] = useState('');

  const visibles = produits.filter((p) =>
    p.nom.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div>
      <input
        className="recherche"
        placeholder="Rechercher…"
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
      />
      <p className="compteur">
        {visibles.length} {visibles.length > 1 ? 'produits' : 'produit'}
      </p>
      {visibles.length === 0 ? (
        <p className="vide">Aucun produit trouvé</p>
      ) : (
        <ul>
          {visibles.map((p) => (
            <li key={p.id}>
              {p.nom} – {p.prix} €{' '}
              {p.stock === 0 && <span className="rupture">Rupture</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
`,
  indices: [
    'La liste filtrée se calcule pendant le rendu : `const visibles = produits.filter((p) => p.nom.toLowerCase().includes(recherche.toLowerCase()));`',
    '`{p.stock && <span>…</span>}` affiche « 0 » quand le stock est nul. Écris `{p.stock === 0 && …}`.',
    'Pour choisir entre la liste et le message : `{visibles.length === 0 ? <p className="vide">…</p> : <ul>…</ul>}`.',
  ],
  tests: [
    {
      nom: 'Affiche un <li> par produit',
      aide: 'Utilise `produits.map((p) => <li key={p.id}>…</li>)`.',
      run: async (t) => {
        const w = await t.mount();
        const lis = w.findAll('li');
        t.expect(lis).toHaveLength(4);
        t.expect(lis[1].text()).toBe('Souris – 25 €');
      },
    },
    {
      nom: 'Marque les produits en rupture, sans afficher « 0 »',
      aide: 'Écris `{p.stock === 0 && <span className="rupture">Rupture</span>}`.',
      run: async (t) => {
        const w = await t.mount();
        const lis = w.findAll('li');
        t.expect(w.findAll('.rupture')).toHaveLength(1);
        t.expect(lis[0].find('.rupture').exists()).toBe(true);
        t.expect(lis[0].text()).not.toMatch(/€\s*0/);
        t.expect(lis[2].text()).toBe('Écran – 199 €');
      },
    },
    {
      nom: 'La recherche filtre sans tenir compte des majuscules',
      aide: 'Compare `p.nom.toLowerCase()` avec `recherche.toLowerCase()`.',
      run: async (t) => {
        const w = await t.mount();
        await w.get('input.recherche').setValue('SOU');
        const lis = w.findAll('li');
        t.expect(lis).toHaveLength(1);
        t.expect(lis[0].text()).toBe('Souris – 25 €');
      },
    },
    {
      nom: 'Le compteur accorde « produit » au singulier et au pluriel',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.get('.compteur').text()).toBe('4 produits');
        await w.get('input.recherche').setValue('cas');
        t.expect(w.get('.compteur').text()).toBe('1 produit');
      },
    },
    {
      nom: 'Affiche « Aucun produit trouvé » quand rien ne correspond',
      aide: 'Utilise un ternaire : le message OU la liste.',
      run: async (t) => {
        const w = await t.mount();
        t.expect(w.find('.vide').exists()).toBe(false);
        await w.get('input.recherche').setValue('tablette');
        t.expect(w.get('.vide').text()).toBe('Aucun produit trouvé');
        t.expect(w.findAll('li')).toHaveLength(0);
      },
    },
    {
      nom: 'Utilise la prop produits',
      aide: 'Parcours la prop `produits`, pas la constante `PRODUITS`.',
      run: async (t) => {
        const w = await t.mount({
          produits: [
            { id: 'a', nom: 'Lampe', prix: 30, stock: 2 },
            { id: 'b', nom: 'Tapis', prix: 15, stock: 0 },
          ],
        });
        t.expect(w.findAll('li')).toHaveLength(2);
        t.expect(w.get('.compteur').text()).toBe('2 produits');
      },
    },
  ],
};
