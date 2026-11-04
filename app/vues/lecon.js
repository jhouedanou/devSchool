import { html, icone, duree, $ } from '../util.js';
import { lecon } from '../donnees.js';
import * as prog from '../progression.js';
import { rendreMarkdown } from '../markdown.js';
import { filAriane, sommaire, brancherSommaire, pageErreur, etatQuiz } from './commun.js';

export async function vueLecon(main, p, id) {
  const l = p.lecons.find((x) => x.id === id);
  if (!l) return pageErreur(main, 'Leçon introuvable', `Il n'y a pas de leçon « ${id} » dans le parcours ${p.titre}.`);
  const md = await lecon(p.id, id);
  document.title = `${l.titre} — ${p.titre} — devSchool`;

  const i = p.lecons.indexOf(l);
  const precedente = p.lecons[i - 1];
  const suivante = p.lecons[i + 1];
  const tpsConseilles = l.tps.map((t) => p.tps.find((x) => x.id === t)).filter(Boolean);

  main.innerHTML = html`
  <div class="mise-en-page">
    ${sommaire(p, { lecon: id })}
    <article class="article">
      ${filAriane([{ texte: 'Accueil', lien: '#/' }, { texte: p.titre, lien: `#/${p.id}` }, { texte: `Leçon ${l.numero}` }])}
      <p class="meta-lecon"><span>Leçon ${l.numero} / ${p.lecons.length}</span>${l.duree ? html`<span>${icone('temps')}${duree(l.duree)}</span>` : ''}</p>
      <div class="prose" id="prose"></div>

      <section class="suite" id="suite">
        <h2>Et maintenant ?</h2>
        <div class="suite-etat" id="etat-lecture"></div>
        <div class="suite-actions">
          <a class="carte-action" href="#/${p.id}/quiz/${l.id}">
            <span class="etape-icone">${icone('quiz')}</span>
            <span><strong>Fais le quiz</strong><small>Il faut 70 % pour valider la leçon.</small></span>
            ${etatQuiz(p.id, l.id)}
          </a>
          ${l.exercices.map((e, k) => html`<a class="carte-action" href="#/${p.id}/exercice/${e}">
            <span class="etape-icone">${icone('code')}</span>
            <span><strong>Exercice${l.exercices.length > 1 ? ' ' + (k + 1) : ''}</strong><small>Code dans le navigateur, corrigé par des tests.</small></span>
            ${prog.exerciceReussi(p.id, e) ? html`<span class="pastille pastille-ok">${icone('ok')}Réussi</span>` : ''}
          </a>`)}
          ${tpsConseilles.map((t) => html`<a class="carte-action" href="#/${p.id}/tp/${t.id}">
            <span class="etape-icone">${icone('tp')}</span>
            <span><strong>TP : ${t.titre}</strong><small>Sur ta machine, avec de vrais tests.</small></span>
            ${prog.tpFait(p.id, t.id) ? html`<span class="pastille pastille-ok">${icone('ok')}Terminé</span>` : ''}
          </a>`)}
        </div>
      </section>

      <nav class="precedent-suivant" aria-label="Leçons">
        ${precedente ? html`<a href="#/${p.id}/lecon/${precedente.id}">${icone('retour')}<span><small>Leçon précédente</small>${precedente.titre}</span></a>` : html`<span></span>`}
        ${suivante ? html`<a class="suivant" href="#/${p.id}/lecon/${suivante.id}"><span><small>Leçon suivante</small>${suivante.titre}</span>${icone('fleche')}</a>` : html`<a class="suivant" href="#/${p.id}/examen"><span><small>Fin du parcours</small>Examen final</span>${icone('fleche')}</a>`}
      </nav>
    </article>
  </div>`.s;

  const prose = $('#prose', main);
  rendreMarkdown(md, prose);
  ajouterTableDesMatieres(prose);

  const etat = $('#etat-lecture', main);
  const majEtat = () => {
    const lue = prog.estLue(p.id, l.id);
    etat.innerHTML = lue
      ? html`<p>${icone('ok')}Leçon marquée comme lue. <button type="button" class="lien-bouton" data-action="non-lue">Annuler</button></p>`.s
      : html`<p>Arrivé ici, la leçon sera marquée comme lue. <button type="button" class="lien-bouton" data-action="lue">La marquer maintenant</button></p>`.s;
  };
  majEtat();
  etat.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'lue') prog.marquerLue(p.id, l.id, true);
    if (action === 'non-lue') prog.marquerLue(p.id, l.id, false);
    majEtat();
  });

  // Quand l'élève arrive en bas de la leçon, on la marque comme lue.
  let observateur = null;
  if ('IntersectionObserver' in window && !prog.estLue(p.id, l.id)) {
    observateur = new IntersectionObserver((entrees) => {
      if (entrees.some((x) => x.isIntersecting)) {
        prog.marquerLue(p.id, l.id, true);
        majEtat();
        observateur.disconnect();
      }
    }, { threshold: 0.3 });
    observateur.observe($('#suite', main));
  }

  const debrancher = brancherSommaire(main, p, { lecon: id });
  return () => { debrancher(); if (observateur) observateur.disconnect(); };
}

function ajouterTableDesMatieres(prose) {
  const titres = Array.from(prose.querySelectorAll('h2'));
  if (titres.length < 3) return;
  const nav = document.createElement('nav');
  nav.className = 'table-matieres';
  nav.setAttribute('aria-label', 'Dans cette leçon');
  nav.innerHTML = html`<p>Dans cette leçon</p><ol>${titres.map((h) => html`<li><a href="#${h.id}">${h.textContent}</a></li>`)}</ol>`.s;
  const h1 = prose.querySelector('h1');
  if (h1) h1.after(nav);
  else prose.prepend(nav);
}
