# Formulaire de contact validé

## Objectif

Tu construis un formulaire de contact avec quatre champs contrôlés. Le formulaire vérifie les données au moment de l'envoi. S'il y a des erreurs, il les affiche sous les champs. Sinon, il appelle la prop `onEnvoyer`, affiche une confirmation et se vide.

## Ce que tu vas pratiquer

- Des champs contrôlés : `<input>`, `<select>`, `<textarea>`.
- Un seul gestionnaire `onChange` pour tous les champs, grâce à `event.target.name`.
- Une fonction de validation pure.
- Un affichage conditionnel des erreurs.
- Une prop fonction (`onEnvoyer`) appelée par l'enfant.

Revois si besoin [la leçon sur les formulaires](#/react/lecon/05-formulaires) et [la leçon sur les props](#/react/lecon/02-props).

## Fichiers à modifier

- `exercices/03-formulaire-contact/FormulaireContact.jsx`

## Étapes

1. Rends chaque champ contrôlé : `value={donnees.nom}` et `onChange={modifier}`.
2. Écris `modifier` : lis `name` et `value` dans `event.target`, puis copie l'objet `donnees` avec la nouvelle valeur.
3. Complète `valider(donnees)`. Elle renvoie un objet `{ champ: message }`, vide si tout va bien.
4. Ajoute un état `tentative`. Les erreurs ne s'affichent qu'après un premier envoi raté.
5. Dans `envoyer`, si tout est valide : appelle `onEnvoyer` avec les textes sans espaces autour, vide le formulaire, remets `tentative` à `false` et affiche la confirmation.

Les règles de validation :

| Champ | Règle | Message exact |
|-------|-------|---------------|
| Nom | pas vide (après `trim`) | `Le nom est obligatoire.` |
| Email | forme `texte@texte.texte` | `L'adresse email n'est pas valide.` |
| Sujet | une option choisie | `Choisis un sujet.` |
| Message | au moins 20 caractères (après `trim`) | `Le message doit contenir au moins 20 caractères.` |

Après un envoi réussi, affiche `<p role="status">Merci, ton message a bien été envoyé.</p>`.

Les labels des champs sont `Nom`, `Email`, `Sujet` et `Message`. Le bouton s'appelle `Envoyer`. Les textes sont déjà dans l'objet `MESSAGES` du fichier de départ.

`onEnvoyer` reçoit cet objet :

```js
{ nom: 'Léa Dupont', email: 'lea@exemple.fr', sujet: 'question', message: 'Bonjour, …' }
```

> [!TIP]
> Les erreurs sont une valeur dérivée : calcule-les pendant le rendu avec `valider(donnees)`. Pas besoin d'un état `erreurs`. Elles disparaissent alors dès que le champ est corrigé.

> [!NOTE]
> Le formulaire a l'attribut `noValidate`. Il coupe la validation du navigateur pour laisser la tienne s'afficher.

## Lancer les tests

Depuis le dossier `tp/react` :

```bash
npm test -- 03-formulaire-contact
```

## Critères de réussite

- Chaque champ affiche ce que tu saisis.
- Aucune erreur ne s'affiche avant la première tentative d'envoi.
- Un envoi du formulaire vide affiche les quatre erreurs et n'appelle pas `onEnvoyer`.
- Un email invalide et un message trop court affichent seulement leurs deux erreurs.
- Après une tentative, l'erreur d'un champ disparaît dès qu'il est corrigé.
- Si tout est valide, `onEnvoyer` est appelée une fois, avec les données sans espaces autour.
- Après l'envoi, la confirmation s'affiche, les champs sont vides et aucune erreur n'apparaît.

## Pour aller plus loin

- Ajoute `aria-invalid` sur les champs en erreur et relie chaque message avec `aria-describedby`.
- Désactive le bouton « Envoyer » tant que le formulaire n'est pas valide. Est-ce mieux pour l'utilisateur ?
- Affiche un compteur de caractères sous le message (« 12 / 20 »).
