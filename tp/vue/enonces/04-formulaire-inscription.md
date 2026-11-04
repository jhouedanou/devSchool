# Formulaire d'inscription validé

## Objectif

Tu crées un formulaire d'inscription qui vérifie les champs pendant la saisie.
Chaque erreur s'affiche quand l'utilisateur quitte le champ.
Le bouton reste désactivé tant que le formulaire n'est pas valide.
À l'envoi, le composant émet `inscrit` avec le nom et l'email.

## Ce que tu vas pratiquer

- `v-model` sur un objet `reactive` ;
- la validation avec un `computed` ;
- l'événement `@blur` pour savoir si un champ a été « touché » ;
- `@submit.prevent` et `defineEmits`.

Leçons utiles : [les formulaires](#/vue/lecon/04-formulaires) et [la réactivité](#/vue/lecon/02-reactivite).

## Fichiers à modifier

- `exercices/04-formulaire-inscription/Inscription.vue`

## Étapes

1. Déclare l'événement `inscrit` avec `defineEmits`.
2. Complète le `computed` `erreurs`. Une chaîne vide veut dire « pas d'erreur » :
   - `nom` : obligatoire, après `trim()` → « Le nom est obligatoire. »
   - `email` : doit respecter `REGEX_EMAIL` → « L'adresse email n'est pas valide. »
   - `motDePasse` : 8 caractères minimum → « Le mot de passe doit contenir au moins 8 caractères. »
   - `confirmation` : identique au mot de passe → « Les mots de passe ne correspondent pas. »
3. Complète `valide` : aucune erreur et la case CGU cochée.
4. Le champ « nom » est déjà complet. Fais pareil pour les autres : `@blur` qui marque le champ comme touché, puis un message d'erreur affiché seulement si le champ est touché.
5. Ajoute `:disabled="!valide"` sur le bouton.
6. Dans `envoyer()`, si le formulaire est valide, émets `inscrit` avec `{ nom, email }` (nettoyés avec `trim()`). N'envoie jamais le mot de passe.

Les tests utilisent ces sélecteurs :

| Élément | Sélecteur |
|---------|-----------|
| Champs | `[data-test="nom"]`, `[data-test="email"]`, `[data-test="mot-de-passe"]`, `[data-test="confirmation"]` |
| Case CGU | `[data-test="cgu"]` |
| Bouton « Créer mon compte » (type submit) | `[data-test="envoyer"]` |
| Messages d'erreur | `[data-test="erreur-nom"]`, `[data-test="erreur-email"]`, `[data-test="erreur-mot-de-passe"]`, `[data-test="erreur-confirmation"]` |

> [!IMPORTANT]
> Le bouton désactivé ne suffit pas : la touche Entrée envoie aussi le formulaire. Vérifie `valide` dans `envoyer()`.

## Lancer les tests

Depuis le dossier `tp/vue` :

```bash
npm test -- 04-formulaire-inscription
```

Dans la galerie (`npm run dev`), les événements émis s'affichent sous le formulaire.

## Critères de réussite

- Aucune erreur n'est affichée au départ.
- Le bouton « Créer mon compte » est désactivé au départ.
- Un nom vide (ou fait d'espaces) affiche une erreur.
- Un email invalide affiche une erreur, qui disparaît quand l'email est corrigé.
- Un mot de passe de moins de 8 caractères affiche une erreur.
- Une confirmation différente du mot de passe affiche une erreur.
- Le bouton reste désactivé tant que les CGU ne sont pas cochées.
- L'envoi émet `inscrit` avec exactement `{ nom, email }`.
- Un formulaire invalide envoyé avec Entrée n'émet rien.

## Pour aller plus loin

- Affiche un message « Bienvenue, Ada ! » après l'inscription et vide le formulaire.
- Ajoute un indicateur de force du mot de passe (faible, moyen, fort).
- Sors la logique de validation dans un composable `useValidation()`.
