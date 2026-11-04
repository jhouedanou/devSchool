import { html, icone, duree, pluriel } from '../util.js';
import * as prog from '../progression.js';
import { barre, filAriane, etatQuiz, pastille, carteTp } from './commun.js';

export async function vueParcours(main, p) {
  document.title = `${p.titre} — devSchool`;
  const s = prog.statsParcours(p);
  const etape = prog.prochaineEtape(p);
  const dureeTotale = p.lecons.reduce((t, l) => t + (l.duree || 0), 0) + p.tps.reduce((t, x) => t + (x.duree || 0), 0);
  const examen = prog.resultatExamen(p.id);

  main.innerHTML = html`
  <div class="page-parcours">
    ${filAriane([{ texte: 'Accueil', lien: '#/' }, { texte: p.titre }])}
    <section class="tete-parcours">
      <div>
        <p class="surtitre"><span class="point"></span>${p.version}</p>
        <h1>${p.titre}</h1>
        <p class="chapo">${p.description}</p>
        <p class="discret">${pluriel(s.lecons, 'leçon')} · ${pluriel(s.exercices, 'exercice')} · ${pluriel(s.tps, 'TP', 'TP')} · environ ${duree(dureeTotale)}</p>
        <div class="hero-actions">
          ${etape
            ? html`<a class="bouton bouton-principal" href="${etape.lien}">${icone('lecture')}${s.faits ? 'Continuer' : 'Commencer'} : ${etape.titre}</a>`
            : html`<span class="pastille pastille-ok">${icone('ok')}Parcours terminé</span>`}
          <a class="bouton" href="#/${p.id}/installation">${icone('dossier')}Installer les TP</a>
        </div>
      </div>
      <div class="bilan">
        <p class="hero-pourcentage"><strong>${s.pourcentage}</strong>&nbsp;%</p>
        ${barre(s.pourcentage, 'Progression ' + p.titre)}
        <dl>
          <div><dt>Leçons lues</dt><dd>${s.lues} / ${s.lecons}</dd></div>
          <div><dt>Quiz réussis</dt><dd>${s.quizOk} / ${s.lecons}</dd></div>
          <div><dt>Exercices</dt><dd>${s.exosOk} / ${s.exercices}</dd></div>
          <div><dt>TP terminés</dt><dd>${s.tpsOk} / ${s.tps}</dd></div>
        </dl>
      </div>
    </section>

    ${p.objectifs && p.objectifs.length ? html`<section class="section">
      <h2>À la fin, tu sauras</h2>
      <ul class="objectifs">${p.objectifs.map((o) => html`<li>${icone('ok')}<span>${o}</span></li>`)}</ul>
    </section>` : ''}

    <section class="section">
      <h2>Leçons</h2>
      <ol class="liste-lecons">
        ${p.lecons.map((l) => {
          const lue = prog.estLue(p.id, l.id);
          const exosOk = l.exercices.filter((e) => prog.exerciceReussi(p.id, e)).length;
          return html`<li class="ligne-lecon ${lue && prog.quizReussi(p.id, l.id) ? 'faite' : ''}">
            <span class="ligne-numero">${l.numero}</span>
            <div class="ligne-corps">
              <a class="ligne-titre" href="#/${p.id}/lecon/${l.id}">${l.titre}</a>
              ${l.resume ? html`<p>${l.resume}</p>` : ''}
              <div class="ligne-actions">
                <a href="#/${p.id}/lecon/${l.id}">${pastille(lue, lue ? 'Lue' : 'Leçon', '', 'lecon')}</a>
                <a href="#/${p.id}/quiz/${l.id}">${etatQuiz(p.id, l.id)}</a>
                ${l.exercices.length ? html`<a href="#/${p.id}/exercice/${l.exercices.find((e) => !prog.exerciceReussi(p.id, e)) || l.exercices[0]}">${pastille(exosOk === l.exercices.length, `Exercices ${exosOk}/${l.exercices.length}`, '', 'code')}</a>` : ''}
                ${l.duree ? html`<span class="duree">${icone('temps')}${duree(l.duree)}</span>` : ''}
              </div>
            </div>
          </li>`;
        })}
      </ol>
    </section>

    ${p.tps.length ? html`<section class="section">
      <div class="section-tete">
        <h2>Travaux pratiques</h2>
        <a href="#/${p.id}/installation">${icone('dossier')}Installer le projet</a>
      </div>
      <p class="discret">Les TP se font sur ta machine, dans le dossier <code>tp/${p.id}</code> du dépôt. Les tests te disent quand c'est fini.</p>
      <div class="grille-tps">${p.tps.map((t) => carteTp(p, t))}</div>
    </section>` : ''}

    <section class="section">
      <a class="carte-examen" href="#/${p.id}/examen">
        <span class="etape-icone">${icone('examen')}</span>
        <div>
          <h2>Examen final</h2>
          <p>20 questions tirées au hasard dans tous les quiz du parcours. Il faut 70 % pour le réussir.</p>
        </div>
        ${examen ? pastille(examen.meilleur >= prog.SEUIL_REUSSITE, `Meilleur : ${examen.meilleur} %`) : html`<span class="bouton">Commencer ${icone('fleche')}</span>`}
      </a>
    </section>
  </div>`.s;
}
