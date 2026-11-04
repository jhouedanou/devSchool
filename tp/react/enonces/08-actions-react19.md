# Formulaire avec useActionState (React 19)

## Objectif

Tu construis un formulaire d'inscription avec les actions de React 19. Le formulaire envoie ses données à une fonction async. Le bouton se désactive pendant l'envoi. Un message de succès ou d'erreur s'affiche ensuite. Tu n'écris ni `onSubmit`, ni `preventDefault`, ni état « en cours ».

## Ce que tu vas pratiquer

- `<form action={…}>` : une fonction à la place d'une URL.
- `useActionState(action, etatInitial)` et sa signature `(etatPrecedent, formData)`.
- `FormData` et `formData.get('pseudo')`.
- `useFormStatus()` dans un composant enfant du formulaire.
- Les erreurs : celles qu'on renvoie et celles qu'on attrape.

Revois si besoin [la leçon sur les formulaires](#/react/lecon/05-formulaires) et [la leçon sur React 19](#/react/lecon/11-react19-tests).

## Fichiers à modifier

- `exercices/08-actions-react19/Inscription.jsx`

## Étapes

1. Importe `useActionState` depuis `react` et `useFormStatus` depuis `react-dom`.
2. Dans `BoutonEnvoyer`, lis `pending` avec `useFormStatus()`. Pendant l'envoi, désactive le bouton et affiche « Envoi en cours ».
3. Dans `Inscription`, appelle `useActionState`. Il renvoie `[etat, actionFormulaire, enCours]`.
4. Écris l'action : `async (etatPrecedent, formData) => { … }`. Appelle `await inscrire(formData)` et renvoie `{ statut: 'succes' | 'erreur', message }`.
5. Entoure l'appel d'un `try` / `catch`. Si `inscrire` lève une erreur, renvoie le message générique.
6. Remplace `onSubmit` par `action={actionFormulaire}` sur le `<form>`.
7. Affiche le message selon `etat.statut`.

Ce que renvoie `inscrire(formData)` (fourni en prop) :

| Cas | Valeur | Affichage exact |
|-----|--------|-----------------|
| Succès | `{ ok: true, message: 'Bienvenue lea !' }` | `<p role="status">Bienvenue lea !</p>` |
| Refus | `{ ok: false, message: 'Ce pseudo est déjà pris.' }` | `<p role="alert">Ce pseudo est déjà pris.</p>` |
| Panne | lève une erreur | `<p role="alert">Une erreur est survenue. Réessaie plus tard.</p>` |

Les labels sont `Pseudo` et `Email` (champs `name="pseudo"` et `name="email"`). Le bouton affiche `S'inscrire`, puis `Envoi en cours` pendant l'envoi.

> [!IMPORTANT]
> L'action de `useActionState` reçoit d'abord l'état précédent, puis le `FormData`. Si tu écris `useActionState(inscrire, …)`, `inscrire` reçoit l'état précédent au lieu des données. Un test le vérifie.

> [!NOTE]
> `useFormStatus` lit l'état du `<form>` **parent**. Il ne marche pas dans le composant qui rend le `<form>`. C'est pour ça que le bouton est un composant séparé.

> [!TIP]
> Après une action réussie, React vide lui-même les champs non contrôlés du formulaire.

## Lancer les tests

Depuis le dossier `tp/react` :

```bash
npm test -- 08-actions-react19
```

## Critères de réussite

- Le formulaire affiche les champs Pseudo et Email et le bouton « S'inscrire ».
- `inscrire` est appelée une fois avec un `FormData` qui contient `pseudo` et `email`.
- Pendant l'envoi, le bouton affiche « Envoi en cours » et il est désactivé. Ensuite, il est réactivé.
- Le message de succès renvoyé par `inscrire` s'affiche dans `role="status"`.
- Le message de refus (`ok: false`) s'affiche dans `role="alert"`.
- Si `inscrire` lève une erreur, « Une erreur est survenue. Réessaie plus tard. » s'affiche.
- Chaque nouvel envoi remplace l'ancien message.
- `BoutonEnvoyer` se désactive tout seul dans n'importe quel formulaire, sans prop.

## Pour aller plus loin

- Utilise `enCours` (le 3ᵉ élément de `useActionState`) pour ajouter `aria-busy` sur le formulaire.
- Garde les valeurs saisies en cas d'erreur : renvoie-les dans l'état et utilise `defaultValue`.
- Essaie `useOptimistic` pour afficher le pseudo avant la réponse du serveur.
