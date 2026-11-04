# Conditions et listes

## Objectifs

- Afficher un élément selon une condition (`if`, ternaire, `&&`).
- Ne rien afficher avec `return null`.
- Afficher une liste avec `map`.
- Choisir une bonne `key` et comprendre pourquoi l'index est risqué.
- Filtrer et trier une liste avant de l'afficher.

## Les conditions

Le JSX n'a pas de `v-if`. On utilise du JavaScript normal.

### `if` et retour anticipé

```jsx
function Message({ connecte, nom }) {
  if (!connecte) {
    return <p>Connecte-toi pour continuer.</p>;
  }
  return <p>Bonjour {nom} !</p>;
}
```

### Le ternaire `? :`

Pour choisir entre deux affichages **dans** le JSX :

```jsx
<button>{enCours ? 'Envoi…' : 'Envoyer'}</button>

<p className={erreur ? 'champ erreur' : 'champ'}>…</p>
```

### Le `&&`

Pour afficher quelque chose **ou rien** :

```jsx
{nbMessages > 0 && <span className="badge">{nbMessages}</span>}
```

Si la condition est fausse, React n'affiche rien.

> [!WARNING]
> Avec un nombre à gauche, `&&` peut afficher `0`. `{nbMessages && <Badge />}` affiche **0** quand `nbMessages` vaut 0. Écris une vraie condition : `{nbMessages > 0 && <Badge />}`.

### `return null`

Un composant peut ne rien afficher en renvoyant `null`.

```jsx
function Alerte({ message }) {
  if (!message) return null;
  return <div className="alerte">{message}</div>;
}
```

### Une variable pour les cas compliqués

Quand il y a plus de deux cas, prépare le JSX dans une variable.

```jsx
let contenu;
if (statut === 'chargement') contenu = <p>Chargement…</p>;
else if (statut === 'erreur') contenu = <p className="erreur">Erreur</p>;
else contenu = <Liste elements={elements} />;

return <section>{contenu}</section>;
```

## Les listes avec `map`

Un tableau d'éléments JSX s'affiche directement. On transforme les données avec `map`.

```jsx
const fruits = [
  { id: 'f1', nom: 'Pomme' },
  { id: 'f2', nom: 'Poire' },
  { id: 'f3', nom: 'Kiwi' },
];

export default function ListeFruits() {
  return (
    <ul>
      {fruits.map((fruit) => (
        <li key={fruit.id}>{fruit.nom}</li>
      ))}
    </ul>
  );
}
```

Avec des accolades dans la fonction fléchée, n'oublie pas le `return` :

```jsx
{fruits.map((fruit) => {
  const label = fruit.nom.toUpperCase();
  return <li key={fruit.id}>{label}</li>;
})}
```

## La `key`

Chaque élément d'une liste a besoin d'une prop `key`. Elle permet à React de savoir **quel élément est lequel** entre deux rendus.

Une bonne `key` est :

- **unique** parmi ses frères (pas dans toute l'application) ;
- **stable** : elle ne change pas d'un rendu à l'autre.

Prends l'identifiant de tes données : `id` de la base, `slug`, code produit…

### Pourquoi pas l'index ?

```jsx
{taches.map((tache, index) => <Tache key={index} tache={tache} />)}
```

Si tu supprimes, insères ou tries des éléments, l'index de chaque élément change. React croit alors que c'est le même élément et **garde le mauvais état** : une case cochée ou un texte tapé se retrouve sur la mauvaise ligne.

L'index est acceptable seulement si la liste ne change jamais d'ordre et qu'on n'y ajoute ni ne supprime rien.

### Créer un identifiant

Si tes données n'ont pas d'`id`, crée-le **quand tu crées l'élément**, pas pendant le rendu.

```jsx
function ajouter(texte) {
  setTaches([...taches, { id: crypto.randomUUID(), texte }]);
}
```

> [!WARNING]
> `key={Math.random()}` change à chaque rendu : React recrée tous les éléments et perd leur état.

### La `key` sur le bon élément

La `key` se met sur l'élément renvoyé par `map`, pas à l'intérieur. Pour un fragment, utilise `<Fragment key>`.

```jsx
import { Fragment } from 'react';

{glossaire.map((terme) => (
  <Fragment key={terme.id}>
    <dt>{terme.mot}</dt>
    <dd>{terme.definition}</dd>
  </Fragment>
))}
```

### `key` pour réinitialiser un composant

Changer la `key` d'un composant le recrée de zéro (avec un état neuf).

```jsx
<FormulaireProfil key={userId} userId={userId} />
```

## Filtrer et trier

On filtre et on trie **pendant le rendu**, à partir de l'état. Le résultat n'est pas stocké : c'est de l'état dérivé.

```jsx
import { useState } from 'react';

export default function Annuaire({ personnes }) {
  const [recherche, setRecherche] = useState('');

  const visibles = personnes
    .filter((p) => p.nom.toLowerCase().includes(recherche.toLowerCase()))
    .toSorted((a, b) => a.nom.localeCompare(b.nom));

  return (
    <>
      <input value={recherche} onChange={(e) => setRecherche(e.target.value)} />
      {visibles.length === 0 ? (
        <p>Aucun résultat</p>
      ) : (
        <ul>
          {visibles.map((p) => <li key={p.id}>{p.nom}</li>)}
        </ul>
      )}
    </>
  );
}
```

`toSorted()` renvoie un nouveau tableau. `sort()` modifierait le tableau des props.

## Pièges fréquents

- **Oublier la `key`** : React affiche « Each child in a list should have a unique "key" prop ».
- **`key={index}`** sur une liste qui change : l'état se mélange entre les lignes.
- **`0 &&`** : affiche `0`. Compare explicitement : `n > 0 &&`.
- **Oublier `return`** dans un `map` avec accolades : rien ne s'affiche.
- **`sort()` sur une prop ou l'état** : il modifie le tableau d'origine. Utilise `toSorted()`.
- **Stocker la liste filtrée dans l'état** : calcule-la pendant le rendu.

## Résumé

- Conditions : `if` + `return`, ternaire `a ? b : c`, `condition && <X />`, `return null`.
- Listes : `tableau.map((x) => <li key={x.id}>…</li>)`.
- La `key` est unique parmi les frères et stable. Prends l'`id` des données, pas l'index.
- Filtrer et trier se fait pendant le rendu, avec `filter` et `toSorted`.
- Changer la `key` d'un composant le réinitialise.

## Pour pratiquer

Fais l'exercice [Liste filtrée](#/react/exercice/05-liste-filtree), puis le TP [Liste de tâches](#/react/tp/02-todo-list).
