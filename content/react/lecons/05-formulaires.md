# Formulaires

## Objectifs

- Écrire des champs contrôlés (`value` + `onChange`).
- Gérer plusieurs champs avec un seul objet d'état.
- Utiliser une case à cocher, un `select` et un `textarea`.
- Valider les données et gérer l'envoi avec `onSubmit`.
- Connaître les actions de formulaire de React 19 : `<form action>`, `useActionState`, `useFormStatus`.

## Le champ contrôlé

Un champ est **contrôlé** quand sa valeur vient de l'état React. Tu lui passes `value` et tu mets l'état à jour dans `onChange`.

```jsx
import { useState } from 'react';

export default function Recherche() {
  const [texte, setTexte] = useState('');
  return (
    <>
      <input value={texte} onChange={(e) => setTexte(e.target.value)} />
      <p>Tu cherches : {texte}</p>
    </>
  );
}
```

L'état est la seule source de vérité. Tu peux donc transformer la saisie :

```jsx
<input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
```

> [!WARNING]
> `value` sans `onChange` rend le champ impossible à modifier. React affiche un avertissement dans la console.

## Plusieurs champs avec un objet

Donne à chaque champ un attribut `name` identique à la clé de l'objet. Un seul gestionnaire suffit.

```jsx
const [form, setForm] = useState({ prenom: '', email: '' });

function handleChange(e) {
  const { name, value } = e.target;
  setForm({ ...form, [name]: value });
}

return (
  <>
    <input name="prenom" value={form.prenom} onChange={handleChange} />
    <input name="email" type="email" value={form.email} onChange={handleChange} />
  </>
);
```

`[name]: value` est une clé calculée : la clé de l'objet est la valeur de `name`.

## Les autres champs

### Case à cocher

Une case à cocher utilise `checked` et `e.target.checked` (un booléen), pas `value`.

```jsx
const [accepte, setAccepte] = useState(false);

<label>
  <input type="checkbox" checked={accepte} onChange={(e) => setAccepte(e.target.checked)} />
  J'accepte les conditions
</label>
```

### Liste déroulante et zone de texte

En React, `<select>` et `<textarea>` prennent aussi `value`.

```jsx
<select value={pays} onChange={(e) => setPays(e.target.value)}>
  <option value="">Choisis un pays</option>
  <option value="fr">France</option>
  <option value="be">Belgique</option>
</select>

<textarea value={message} onChange={(e) => setMessage(e.target.value)} />
```

### Boutons radio

```jsx
<label>
  <input type="radio" name="taille" value="S" checked={taille === 'S'} onChange={(e) => setTaille(e.target.value)} /> S
</label>
<label>
  <input type="radio" name="taille" value="M" checked={taille === 'M'} onChange={(e) => setTaille(e.target.value)} /> M
</label>
```

### Les nombres

`e.target.value` est **toujours une chaîne**, même avec `type="number"`. Convertis si besoin : `Number(e.target.value)`.

## L'envoi avec `onSubmit`

Mets le gestionnaire sur le `<form>`, pas sur le bouton. Ainsi, la touche Entrée envoie aussi le formulaire.

```jsx
function handleSubmit(e) {
  e.preventDefault();          // empêche le rechargement de la page
  envoyer(form);
}

return (
  <form onSubmit={handleSubmit}>
    {/* champs */}
    <button type="submit">Envoyer</button>
  </form>
);
```

Dans un `<form>`, un `<button>` sans `type` est un bouton d'envoi. Pour un autre bouton, écris `type="button"`.

## La validation

Les erreurs se **calculent** à partir de l'état (état dérivé). On les affiche souvent après la première tentative d'envoi.

```jsx
const [form, setForm] = useState({ email: '', motDePasse: '' });
const [envoye, setEnvoye] = useState(false);

const erreurs = {};
if (!form.email.includes('@')) erreurs.email = 'Email invalide';
if (form.motDePasse.length < 8) erreurs.motDePasse = '8 caractères minimum';
const valide = Object.keys(erreurs).length === 0;

function handleSubmit(e) {
  e.preventDefault();
  setEnvoye(true);
  if (!valide) return;
  onInscription(form);
}

return (
  <form onSubmit={handleSubmit}>
    <input name="email" value={form.email} onChange={handleChange} />
    {envoye && erreurs.email && <p className="erreur">{erreurs.email}</p>}
    {/* … */}
  </form>
);
```

Garde aussi les attributs HTML (`required`, `type="email"`, `minLength`) : ils aident l'utilisateur. Mais valide toujours côté serveur.

## Les champs non contrôlés

Tu peux aussi laisser le DOM garder la valeur, et la lire à l'envoi avec `FormData`. Utilise `defaultValue` pour la valeur de départ.

```jsx
function handleSubmit(e) {
  e.preventDefault();
  const donnees = Object.fromEntries(new FormData(e.currentTarget));
  console.log(donnees); // { prenom: '…', email: '…' }
}

<form onSubmit={handleSubmit}>
  <input name="prenom" defaultValue="Ada" />
  <input name="email" />
  <button>Envoyer</button>
</form>
```

C'est plus simple quand tu n'as pas besoin de la valeur pendant la saisie.

## React 19 : les actions de formulaire

> [!NOTE]
> **Nouveau en React 19.** Ces API n'existent pas en React 18.3, la version des exercices du site. Tu les pratiques dans le TP local [Formulaire avec useActionState](#/react/tp/08-actions-react19).

### `<form action={fonction}>`

En React 19, `action` peut recevoir une fonction (synchrone ou `async`). Elle reçoit un `FormData`. Pas besoin de `preventDefault()`.

```jsx
export default function Newsletter() {
  async function inscrire(formData) {
    await envoyerEmail(formData.get('email'));
  }
  return (
    <form action={inscrire}>
      <input name="email" type="email" />
      <button>S'inscrire</button>
    </form>
  );
}
```

Quand l'action réussit, React **vide les champs non contrôlés** du formulaire.

### `useActionState`

`useActionState` garde le résultat de la dernière action (un message, des erreurs) et indique si elle est en cours.

```jsx
import { useActionState } from 'react';

async function inscrire(etatPrecedent, formData) {
  const email = formData.get('email');
  if (!email.includes('@')) return { erreur: 'Email invalide' };
  await envoyerEmail(email);
  return { succes: true };
}

export default function Newsletter() {
  const [etat, action, enCours] = useActionState(inscrire, {});
  return (
    <form action={action}>
      <input name="email" />
      <button disabled={enCours}>{enCours ? 'Envoi…' : "S'inscrire"}</button>
      {etat.erreur && <p className="erreur">{etat.erreur}</p>}
      {etat.succes && <p>Merci !</p>}
    </form>
  );
}
```

- La fonction reçoit d'abord l'**état précédent**, puis le `FormData`.
- Ce qu'elle renvoie devient le nouvel `etat`.
- `enCours` vaut `true` pendant l'action.

### `useFormStatus`

`useFormStatus` (importé de `react-dom`) donne l'état d'envoi du formulaire **parent**. Il doit être appelé dans un composant placé **à l'intérieur** du `<form>`.

```jsx
import { useFormStatus } from 'react-dom';

function BoutonEnvoyer() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? 'Envoi…' : 'Envoyer'}</button>;
}

<form action={inscrire}>
  <input name="email" />
  <BoutonEnvoyer />
</form>
```

## Pièges fréquents

- **`value` sans `onChange`** : le champ est bloqué.
- **`value={undefined}` puis une chaîne** : React prévient qu'un champ passe de « non contrôlé » à « contrôlé ». Initialise toujours avec `''`.
- **`e.target.value` sur une case à cocher** : utilise `e.target.checked`.
- **Oublier `e.preventDefault()`** avec `onSubmit` : la page se recharge.
- **`onClick` sur le bouton au lieu de `onSubmit` sur le formulaire** : la touche Entrée ne passe plus par ta fonction.
- **`useFormStatus` dans le composant qui rend le `<form>`** : il ne voit rien. Place-le dans un composant enfant.
- **Nombre en chaîne** : `"3" + 1` donne `"31"`. Convertis avec `Number()`.

## Résumé

- Champ contrôlé : `value={etat}` + `onChange={(e) => setEtat(e.target.value)}`.
- Plusieurs champs : un objet, des attributs `name`, et `{ ...form, [name]: value }`.
- Case à cocher : `checked` et `e.target.checked`.
- Envoi : `onSubmit` sur le `<form>` + `e.preventDefault()`.
- La validation se calcule à partir de l'état.
- React 19 : `<form action={fn}>`, `useActionState(action, etatInitial)` et `useFormStatus()`.

## Pour pratiquer

Fais l'exercice [Formulaire d'inscription](#/react/exercice/06-formulaire-inscription). Ensuite, fais le TP [Formulaire de contact validé](#/react/tp/03-formulaire-contact), puis le TP [Formulaire avec useActionState (React 19)](#/react/tp/08-actions-react19).
