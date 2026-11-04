import { html, brut, icone, melanger, normaliserReponse, $, $$, pluriel } from '../util.js';
import { quiz as chargerQuiz } from '../donnees.js';
import * as prog from '../progression.js';
import { markdownEnLigne, markdownEnHtml, blocCode } from '../markdown.js';
import { filAriane, sommaire, brancherSommaire, pageErreur, barre } from './commun.js';

const TAILLE_EXAMEN = 20;
const LIBELLES_TYPE = { unique: 'Une seule réponse', multiple: 'Plusieurs réponses possibles', texte: 'Réponse à écrire' };

export async function vueQuiz(main, p, id) {
  const l = p.lecons.find((x) => x.id === id);
  if (!l) return pageErreur(main, 'Quiz introuvable', `Il n'y a pas de leçon « ${id} » dans le parcours ${p.titre}.`);
  const questions = await chargerQuiz(p.id, id);
  document.title = `Quiz : ${l.titre} — devSchool`;
  const i = p.lecons.indexOf(l);
  const suivante = p.lecons[i + 1];

  return lancer(main, {
    p,
    actif: { lecon: id, quiz: true },
    fil: [{ texte: 'Accueil', lien: '#/' }, { texte: p.titre, lien: `#/${p.id}` }, { texte: `Leçon ${l.numero}`, lien: `#/${p.id}/lecon/${id}` }, { texte: 'Quiz' }],
    surtitre: `Quiz · Leçon ${l.numero}`,
    titre: l.titre,
    questions,
    precedent: prog.resultatQuiz(p.id, id),
    enregistrer: (pct) => prog.enregistrerQuiz(p.id, id, pct),
    liensApres: [
      { texte: 'Relire la leçon', lien: `#/${p.id}/lecon/${id}`, icone: 'lecon' },
      ...(l.exercices[0] ? [{ texte: "Faire l'exercice", lien: `#/${p.id}/exercice/${l.exercices[0]}`, icone: 'code', principal: true }] : []),
      ...(suivante ? [{ texte: 'Leçon suivante', lien: `#/${p.id}/lecon/${suivante.id}`, icone: 'fleche', principal: !l.exercices[0] }] : [{ texte: 'Examen final', lien: `#/${p.id}/examen`, icone: 'examen', principal: !l.exercices[0] }]),
    ],
  });
}

export async function vueExamen(main, p) {
  const tous = (await Promise.all(p.lecons.map((l) => chargerQuiz(p.id, l.id).catch(() => [])))).flat();
  document.title = `Examen final : ${p.titre} — devSchool`;
  const tirer = () => melanger(tous).slice(0, TAILLE_EXAMEN);
  return lancer(main, {
    p,
    actif: {},
    fil: [{ texte: 'Accueil', lien: '#/' }, { texte: p.titre, lien: `#/${p.id}` }, { texte: 'Examen final' }],
    surtitre: `Examen final · ${p.titre}`,
    titre: `${Math.min(TAILLE_EXAMEN, tous.length)} questions sur tout le parcours`,
    questions: tirer(),
    tirer,
    precedent: prog.resultatExamen(p.id),
    enregistrer: (pct) => prog.enregistrerExamen(p.id, pct),
    liensApres: [{ texte: 'Retour au parcours', lien: `#/${p.id}`, icone: 'retour', principal: true }],
  });
}

function preparer(questions) {
  return questions.map((q) => ({
    ...q,
    ordre: q.type === 'texte' ? [] : melanger(q.choix.map((_, i) => i)),
  }));
}

function lancer(main, options) {
  const { p, actif } = options;
  let questions = preparer(options.questions);

  function rendre() {
    const precedent = options.precedent;
    main.innerHTML = html`
    <div class="mise-en-page">
      ${sommaire(p, actif)}
      <article class="article quiz">
        ${filAriane(options.fil)}
        <header class="quiz-tete">
          <p class="surtitre">${icone('quiz')}${options.surtitre}</p>
          <h1>${options.titre}</h1>
          <p class="discret">${pluriel(questions.length, 'question')} · il faut ${prog.SEUIL_REUSSITE} % pour réussir${precedent ? html` · ton meilleur score : <strong>${precedent.meilleur} %</strong>` : ''}</p>
        </header>
        <div id="score" aria-live="polite"></div>
        <form id="formulaire-quiz" novalidate>
          ${questions.map((q, i) => rendreQuestion(q, i, questions.length))}
          <div class="quiz-pied">
            <p class="discret" id="avertissement" aria-live="polite"></p>
            <button type="submit" class="bouton bouton-principal" id="valider">${icone('ok')}Valider mes réponses</button>
          </div>
        </form>
      </article>
    </div>`.s;

    const formulaire = $('#formulaire-quiz', main);
    let confirmer = false;
    formulaire.addEventListener('submit', (e) => {
      e.preventDefault();
      const sansReponse = questions.filter((q, i) => !repondue(formulaire, q, i)).length;
      if (sansReponse && !confirmer) {
        confirmer = true;
        $('#avertissement', main).textContent = `${pluriel(sansReponse, 'question')} sans réponse. Clique encore pour valider quand même.`;
        $('#valider', main).lastChild.textContent = 'Valider quand même';
        return;
      }
      corriger(formulaire);
    });
    formulaire.addEventListener('change', () => {
      if (confirmer) {
        confirmer = false;
        $('#avertissement', main).textContent = '';
        $('#valider', main).lastChild.textContent = 'Valider mes réponses';
      }
    });
  }

  function corriger(formulaire) {
    let justes = 0;
    questions.forEach((q, i) => {
      const carte = formulaire.querySelector(`[data-question="${i}"]`);
      const juste = estJuste(formulaire, q, i);
      if (juste) justes++;
      carte.classList.add(juste ? 'juste' : 'faux');
      $$('input', carte).forEach((input) => { input.disabled = true; });
      if (q.type !== 'texte') {
        const bonnes = q.type === 'unique' ? [q.reponse] : q.reponses;
        $$('.choix', carte).forEach((label) => {
          const idx = Number(label.dataset.index);
          const coche = label.querySelector('input').checked;
          if (bonnes.includes(idx)) label.classList.add('bonne');
          else if (coche) label.classList.add('mauvaise');
        });
      }
      const correction = $('.correction', carte);
      const attendue = q.type === 'texte'
        ? html`<p class="attendue">Réponse attendue : <code>${q.acceptees[0]}</code></p>`
        : '';
      correction.innerHTML = html`
        <p class="verdict">${juste ? icone('ok') : icone('ko')}${juste ? 'Bonne réponse' : 'Pas tout à fait'}</p>
        ${juste ? '' : attendue}
        <div class="explication">${brut(markdownEnHtml(q.explication || ''))}</div>`.s;
      correction.hidden = false;
    });
    const pct = Math.round((justes / questions.length) * 100);
    options.enregistrer(pct);
    options.precedent = { meilleur: Math.max(options.precedent?.meilleur || 0, pct) };
    const reussi = pct >= prog.SEUIL_REUSSITE;
    const score = $('#score', main);
    score.innerHTML = html`<section class="score ${reussi ? 'reussi' : 'rate'}">
      <div class="score-chiffre"><strong>${pct}</strong>&nbsp;%</div>
      <div class="score-texte">
        <h2>${reussi ? 'Réussi' : 'Pas encore'}</h2>
        <p>${justes} bonne${justes > 1 ? 's' : ''} réponse${justes > 1 ? 's' : ''} sur ${questions.length}. ${reussi ? 'Tu peux passer à la suite.' : `Il faut ${prog.SEUIL_REUSSITE} %. Lis les explications ci-dessous, puis recommence.`}</p>
        ${barre(pct, 'Score')}
        <div class="hero-actions">
          <button type="button" class="bouton" id="recommencer">${icone('reinit')}Recommencer</button>
          ${options.liensApres.map((x) => html`<a class="bouton ${x.principal ? 'bouton-principal' : ''}" href="${x.lien}">${icone(x.icone)}${x.texte}</a>`)}
        </div>
      </div>
    </section>`.s;
    $('#recommencer', main).addEventListener('click', () => {
      questions = preparer(options.tirer ? options.tirer() : options.questions);
      rendre();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    $('#valider', main).hidden = true;
    $('#avertissement', main).textContent = '';
    score.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  rendre();
  return brancherSommaire(main, p, actif);
}

function rendreQuestion(q, i, total) {
  const nom = `q${i}`;
  return html`<fieldset class="question" data-question="${i}">
    <legend><span class="question-numero">Question ${i + 1} / ${total}</span><span class="question-type">${LIBELLES_TYPE[q.type] || ''}</span></legend>
    <div class="question-texte">${brut(markdownEnLigne(q.question))}</div>
    ${q.code ? brut(blocCode(q.code, q.langage || '')) : ''}
    ${q.type === 'texte'
      ? html`<label class="champ-texte"><span class="visuellement-cache">Ta réponse</span>
          <input type="text" name="${nom}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Ta réponse…"></label>`
      : html`<div class="choix-liste">${q.ordre.map((idx) => html`<label class="choix" data-index="${idx}">
          <input type="${q.type === 'unique' ? 'radio' : 'checkbox'}" name="${nom}" value="${idx}">
          <span>${brut(markdownEnLigne(String(q.choix[idx])))}</span>
        </label>`)}</div>`}
    <div class="correction" hidden></div>
  </fieldset>`;
}

function valeurs(formulaire, i) {
  return $$(`input[name="q${i}"]`, formulaire);
}

function repondue(formulaire, q, i) {
  const inputs = valeurs(formulaire, i);
  if (q.type === 'texte') return inputs[0].value.trim() !== '';
  return inputs.some((x) => x.checked);
}

function estJuste(formulaire, q, i) {
  const inputs = valeurs(formulaire, i);
  if (q.type === 'texte') {
    const r = normaliserReponse(inputs[0].value);
    return r !== '' && q.acceptees.some((a) => normaliserReponse(a) === r);
  }
  const coches = inputs.filter((x) => x.checked).map((x) => Number(x.value)).sort((a, b) => a - b);
  if (q.type === 'unique') return coches.length === 1 && coches[0] === q.reponse;
  const attendues = q.reponses.slice().sort((a, b) => a - b);
  return coches.length === attendues.length && coches.every((v, k) => v === attendues[k]);
}
