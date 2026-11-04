// Morceaux d'interface partagés.
import { html, icone, duree, NIVEAUX } from '../util.js';
import * as prog from '../progression.js';

export function barre(pourcentage, libelle = '') {
  const p = Math.max(0, Math.min(100, Math.round(pourcentage)));
  return html`<div class="barre" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}" aria-label="${libelle || 'Progression'}">
    <span style="width:${p}%"></span>
  </div>`;
}

export function filAriane(elements) {
  return html`<nav class="fil-ariane" aria-label="Fil d'Ariane"><ol>${elements.map((e, i) => (
    i === elements.length - 1 || !e.lien
      ? html`<li aria-current="page">${e.texte}</li>`
      : html`<li><a href="${e.lien}">${e.texte}</a></li>`
  ))}</ol></nav>`;
}

export function pastille(ok, texte, titre = '', iconeSinon = '') {
  return html`<span class="pastille ${ok ? 'pastille-ok' : ''}" title="${titre}">${ok ? icone('ok') : iconeSinon ? icone(iconeSinon) : ''}${texte}</span>`;
}

export function etatQuiz(p, id) {
  const r = prog.resultatQuiz(p, id);
  if (!r) return html`<span class="pastille">${icone('quiz')}Quiz</span>`;
  return pastille(r.meilleur >= prog.SEUIL_REUSSITE, `Quiz ${r.meilleur} %`, `Meilleur score : ${r.meilleur} %`);
}

export function niveau(n) {
  return html`<span class="niveau niveau-${n}" title="Niveau ${NIVEAUX[n] || ''}">${[1, 2, 3].map((i) => html`<i class="${i <= n ? 'plein' : ''}"></i>`)}<span>${NIVEAUX[n] || ''}</span></span>`;
}

/** Sommaire du parcours, affiché à gauche des pages de leçon, quiz, exercice et TP. */
export function sommaire(p, actif = {}) {
  return html`<aside class="sommaire" aria-label="Sommaire du parcours ${p.titre}">
    <details class="sommaire-mobile" ${actif.ouvert ? 'open' : ''}>
      <summary>Sommaire : ${p.titre}</summary>
      ${contenuSommaire(p, actif)}
    </details>
    <div class="sommaire-large">${contenuSommaire(p, actif)}</div>
  </aside>`;
}

function contenuSommaire(p, actif) {
  return html`
    <a class="sommaire-parcours" href="#/${p.id}"><span class="point"></span>${p.titre}<small>${p.version}</small></a>
    <p class="sommaire-titre">Leçons</p>
    <ol class="sommaire-lecons">
      ${p.lecons.map((l) => {
        const lue = prog.estLue(p.id, l.id);
        const quizOk = prog.quizReussi(p.id, l.id);
        const courant = actif.lecon === l.id;
        return html`<li class="${courant ? 'courant' : ''}">
          <a href="#/${p.id}/lecon/${l.id}" ${courant ? html`aria-current="page"` : ''}>
            <span class="numero ${lue && quizOk ? 'fait' : lue ? 'lu' : ''}">${lue && quizOk ? icone('ok') : l.numero}</span>
            <span>${l.titre}</span>
          </a>
          ${courant ? html`<ul class="sommaire-sous">
            <li><a href="#/${p.id}/quiz/${l.id}" class="${actif.quiz ? 'actif' : ''}">${icone('quiz')}Quiz</a></li>
            ${l.exercices.map((e, i) => html`<li><a href="#/${p.id}/exercice/${e}" class="${actif.exercice === e ? 'actif' : ''}">${icone('code')}Exercice ${l.exercices.length > 1 ? i + 1 : ''}${prog.exerciceReussi(p.id, e) ? html` <span class="coche">${icone('ok')}</span>` : ''}</a></li>`)}
          </ul>` : ''}
        </li>`;
      })}
    </ol>
    ${p.tps.length ? html`<p class="sommaire-titre">Travaux pratiques</p>
    <ol class="sommaire-tps">
      ${p.tps.map((t) => html`<li class="${actif.tp === t.id ? 'courant' : ''}"><a href="#/${p.id}/tp/${t.id}">
        <span class="numero ${prog.tpFait(p.id, t.id) ? 'fait' : ''}">${prog.tpFait(p.id, t.id) ? icone('ok') : icone('tp')}</span><span>${t.titre}</span></a></li>`)}
    </ol>
    <a class="sommaire-lien" href="#/${p.id}/installation">${icone('dossier')}Installer le projet de TP</a>` : ''}
    <a class="sommaire-lien" href="#/${p.id}/examen">${icone('examen')}Examen final</a>
  `;
}

export function carteTp(p, t) {
  const fait = prog.tpFait(p.id, t.id);
  return html`<a class="carte-tp ${fait ? 'fait' : ''}" href="#/${p.id}/tp/${t.id}">
    <div class="carte-tp-haut">
      <span class="etiquette">${icone('tp')}TP ${t.id.split('-')[0]}</span>
      ${fait ? html`<span class="pastille pastille-ok">${icone('ok')}Terminé</span>` : ''}
    </div>
    <h3>${t.titre}</h3>
    ${t.resume ? html`<p>${t.resume}</p>` : ''}
    <div class="carte-tp-bas">${niveau(t.niveau || 1)}${t.duree ? html`<span class="duree">${icone('temps')}${duree(t.duree)}</span>` : ''}</div>
  </a>`;
}

export function pageErreur(main, titre, message) {
  main.innerHTML = html`<section class="page-erreur">
    <h1>${titre}</h1>
    <p>${message}</p>
    <a class="bouton bouton-principal" href="#/">Retour à l'accueil</a>
  </section>`.s;
}

/** Met à jour le sommaire quand la progression change. Retourne la fonction de nettoyage. */
export function brancherSommaire(main, p, actif) {
  const maj = () => {
    const ancien = main.querySelector('.sommaire');
    if (!ancien) return;
    const ouvert = ancien.querySelector('details')?.open;
    const tmp = document.createElement('div');
    tmp.innerHTML = sommaire(p, { ...actif, ouvert }).s;
    ancien.replaceWith(tmp.firstElementChild);
  };
  window.addEventListener('progression', maj);
  return () => window.removeEventListener('progression', maj);
}
