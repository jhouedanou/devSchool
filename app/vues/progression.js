import { html, icone, $ } from '../util.js';
import { tousLesParcours } from '../donnees.js';
import * as prog from '../progression.js';
import { barre, filAriane } from './commun.js';

export async function vueProgression(main) {
  const liste = await tousLesParcours();
  document.title = 'Ma progression — devSchool';

  function rendre(message = '') {
    const stats = liste.map((p) => ({ p, s: prog.statsParcours(p), etape: prog.prochaineEtape(p) }));
    main.innerHTML = html`
    <div class="page-simple">
      ${filAriane([{ texte: 'Accueil', lien: '#/' }, { texte: 'Ma progression' }])}
      <h1>Ma progression</h1>
      <p class="chapo">Ta progression est enregistrée dans ce navigateur. Exporte-la pour la garder ou la passer sur un autre appareil.</p>
      ${message ? html`<p class="message-info" role="status">${message}</p>` : ''}
      <div class="tableau-progression">
        ${stats.map(({ p, s, etape }) => html`<section class="ligne-progression" style="--couleur:${p.couleur}">
          <div class="ligne-progression-tete">
            <h2><a href="#/${p.id}"><span class="point"></span>${p.titre}</a></h2>
            <strong>${s.pourcentage} %</strong>
          </div>
          ${barre(s.pourcentage, 'Progression ' + p.titre)}
          <dl>
            <div><dt>Leçons lues</dt><dd>${s.lues} / ${s.lecons}</dd></div>
            <div><dt>Quiz réussis</dt><dd>${s.quizOk} / ${s.lecons}</dd></div>
            <div><dt>Exercices</dt><dd>${s.exosOk} / ${s.exercices}</dd></div>
            <div><dt>TP</dt><dd>${s.tpsOk} / ${s.tps}</dd></div>
            <div><dt>Examen</dt><dd>${s.examen ? `${s.examen.meilleur} %` : '—'}</dd></div>
          </dl>
          ${etape ? html`<a class="lien-suite" href="${etape.lien}">Prochaine étape : ${etape.titre} ${icone('fleche')}</a>` : html`<p class="pastille pastille-ok">${icone('ok')}Parcours terminé</p>`}
        </section>`)}
      </div>

      <section class="section">
        <h2>Sauvegarde</h2>
        <div class="hero-actions">
          <button type="button" class="bouton" id="exporter">Exporter (fichier JSON)</button>
          <label class="bouton">Importer un fichier<input type="file" id="importer" accept="application/json,.json" class="visuellement-cache"></label>
          <button type="button" class="bouton bouton-danger" id="reinitialiser">Tout effacer</button>
        </div>
      </section>
    </div>`.s;

    $('#exporter', main).addEventListener('click', () => {
      const blob = new Blob([prog.exporter()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `devschool-progression-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    });
    $('#importer', main).addEventListener('change', async (e) => {
      const fichier = e.target.files[0];
      if (!fichier) return;
      try {
        prog.importer(await fichier.text());
        rendre('Progression importée.');
      } catch (err) {
        rendre('Import impossible : ' + err.message);
      }
    });
    $('#reinitialiser', main).addEventListener('click', () => {
      if (!window.confirm('Effacer toute ta progression et tes brouillons de code ? Cette action est définitive.')) return;
      prog.reinitialiser();
      rendre('Progression effacée.');
    });
  }

  rendre();
}
