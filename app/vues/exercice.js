import { html, brut, icone, echapper, $, $$, debounce } from '../util.js';
import { exercice as chargerExercice, listeExercices } from '../donnees.js';
import * as prog from '../progression.js';
import { rendreMarkdown, markdownEnLigne, blocCode } from '../markdown.js';
import { creerEditeur } from '../editeur.js';
import { lancerTests, Apercu } from '../execution.js';
import { filAriane, sommaire, brancherSommaire, pageErreur, barre } from './commun.js';

const TYPES = {
  js: { libelle: 'JavaScript', fichier: 'exercice.js', langage: 'js' },
  vue: { libelle: 'Composant Vue', fichier: 'Composant.vue', langage: 'vue' },
  nuxt: { libelle: 'Nuxt (simulé)', fichier: 'app/pages/index.vue', langage: 'vue' },
  react: { libelle: 'Composant React', fichier: 'App.jsx', langage: 'jsx' },
};

export async function vueExercice(main, p, id) {
  const liste = listeExercices(p);
  const position = liste.findIndex((x) => x.id === id);
  if (position < 0) return pageErreur(main, 'Exercice introuvable', `Il n'y a pas d'exercice « ${id} » dans le parcours ${p.titre}.`);
  const { lecon: l } = liste[position];
  const ex = await chargerExercice(p.id, id);
  const type = TYPES[ex.type] || TYPES.js;
  const suivant = liste[position + 1];
  const avecApercu = ex.type !== 'js';
  document.title = `${ex.titre} — Exercice ${p.titre} — devSchool`;

  const codeSauve = prog.lireCode(p.id, id);
  const tests = ex.tests.map((t) => ({ nom: t.nom, aide: t.aide || '', src: t.run.toString() }));
  const indices = ex.indices || [];

  main.innerHTML = html`
  <div class="mise-en-page mise-en-page-large">
    ${sommaire(p, { lecon: l.id, exercice: id })}
    <div class="exercice">
      ${filAriane([{ texte: 'Accueil', lien: '#/' }, { texte: p.titre, lien: `#/${p.id}` }, { texte: `Leçon ${l.numero}`, lien: `#/${p.id}/lecon/${l.id}` }, { texte: 'Exercice' }])}
      <header class="exercice-tete">
        <div>
          <p class="surtitre">${icone('code')}Exercice ${position + 1} / ${liste.length} · ${type.libelle}</p>
          <h1>${ex.titre}</h1>
        </div>
        <div id="badge-reussite">${prog.exerciceReussi(p.id, id) ? html`<span class="pastille pastille-ok">${icone('ok')}Réussi</span>` : ''}</div>
      </header>

      <div class="exercice-grille">
        <section class="exercice-consigne" aria-label="Consigne">
          <div class="prose prose-compacte" id="consigne"></div>
          ${indices.length ? html`<div class="indices">
            <ol id="liste-indices" class="liste-indices"></ol>
            <button type="button" class="bouton bouton-discret" id="bouton-indice">${icone('ampoule')}Afficher un indice (0/${indices.length})</button>
          </div>` : ''}
          <details class="liste-tests">
            <summary>Ce que vérifient les tests (${tests.length})</summary>
            <ul>${ex.tests.map((t) => html`<li>${brut(markdownEnLigne(t.nom))}</li>`)}</ul>
          </details>
          ${ex.type === 'nuxt' ? html`<p class="note-runner">${icone('ampoule')}<span>Ici, Nuxt est <strong>simulé</strong> dans le navigateur : auto-imports, <code>useState</code>, <code>useFetch</code>, <code>useRoute</code>, <code>navigateTo</code> et <code>&lt;NuxtLink&gt;</code> fonctionnent. Pas de vrai serveur.</span></p>` : ''}
          ${ex.type === 'react' ? html`<p class="note-runner">${icone('ampoule')}<span>Les exercices du navigateur tournent avec React 18.3. Les nouveautés de React 19 se pratiquent dans les TP.</span></p>` : ''}
        </section>

        <section class="exercice-travail" aria-label="Ton code">
          <div class="editeur-barre">
            <span class="editeur-fichier">${icone('code')}${type.fichier}</span>
            <div class="editeur-actions">
              <button type="button" class="bouton bouton-discret" id="bouton-reinit" title="Remettre le code de départ">${icone('reinit')}<span>Réinitialiser</span></button>
              <button type="button" class="bouton bouton-discret" id="bouton-solution">${icone('oeil')}<span>Solution</span></button>
              <button type="button" class="bouton bouton-principal" id="bouton-lancer">${icone('lecture')}<span>Lancer les tests</span><kbd>Ctrl ↵</kbd></button>
            </div>
          </div>
          <div class="editeur" id="editeur"><textarea class="editeur-secours" disabled>Chargement de l'éditeur…</textarea></div>
          <div id="zone-solution"></div>

          <div class="onglets" role="tablist" aria-label="Résultats">
            <button type="button" role="tab" id="onglet-tests" data-onglet="tests" aria-selected="${avecApercu ? 'false' : 'true'}">Tests</button>
            ${avecApercu ? html`<button type="button" role="tab" id="onglet-apercu" data-onglet="apercu" aria-selected="true">Aperçu</button>` : ''}
            <button type="button" role="tab" id="onglet-console" data-onglet="console" aria-selected="false">Console <span class="compteur" id="compteur-console"></span></button>
          </div>
          <div class="panneau" id="panneau-tests" role="tabpanel" aria-labelledby="onglet-tests" aria-live="polite" ${avecApercu ? 'hidden' : ''}>
            <p class="discret">Écris ton code, puis clique sur « Lancer les tests » (ou <kbd>Ctrl</kbd> + <kbd>Entrée</kbd>).</p>
          </div>
          ${avecApercu ? html`<div class="panneau panneau-apercu" id="panneau-apercu" role="tabpanel" aria-labelledby="onglet-apercu">
            <div class="apercu-barre">
              <span id="etat-apercu" class="discret">L'aperçu se met à jour quand tu tapes.</span>
              <button type="button" class="lien-bouton" id="bouton-rafraichir">${icone('reinit')}Rafraîchir</button>
            </div>
            <div id="cadre-apercu" class="cadre-apercu-conteneur"></div>
          </div>` : ''}
          <div class="panneau" id="panneau-console" role="tabpanel" aria-labelledby="onglet-console" hidden>
            <ol class="console" id="console"><li class="discret">Rien pour l'instant. Les <code>console.log()</code> s'affichent ici.</li></ol>
          </div>
        </section>
      </div>
    </div>
  </div>`.s;

  rendreMarkdown(ex.consigne, $('#consigne', main));

  // Onglets
  const onglets = $$('[role="tab"]', main);
  function montrer(nom) {
    onglets.forEach((o) => o.setAttribute('aria-selected', String(o.dataset.onglet === nom)));
    ['tests', 'apercu', 'console'].forEach((n) => {
      const panneau = $(`#panneau-${n}`, main);
      if (panneau) panneau.hidden = n !== nom;
    });
  }
  onglets.forEach((o) => o.addEventListener('click', () => montrer(o.dataset.onglet)));

  // Console
  const consoleEl = $('#console', main);
  const compteur = $('#compteur-console', main);
  let nbLogs = 0;
  const consoleVide = `<li class="discret">Rien pour l'instant. Les <code>console.log()</code> s'affichent ici.</li>`;
  function viderConsole() {
    nbLogs = 0;
    compteur.textContent = '';
    consoleEl.innerHTML = consoleVide;
  }
  function ajouterLog(niveau, texte, origine = '') {
    if (!nbLogs) consoleEl.innerHTML = '';
    nbLogs++;
    compteur.textContent = String(nbLogs);
    const li = document.createElement('li');
    li.className = `log log-${niveau}`;
    li.innerHTML = `${origine ? `<span class="log-origine">${echapper(origine)}</span>` : ''}<span>${echapper(texte)}</span>`;
    consoleEl.appendChild(li);
  }

  // Indices
  const boutonIndice = $('#bouton-indice', main);
  if (boutonIndice) {
    let montres = 0;
    boutonIndice.addEventListener('click', () => {
      if (montres >= indices.length) return;
      const li = document.createElement('li');
      li.innerHTML = markdownEnLigne(indices[montres]);
      $('#liste-indices', main).appendChild(li);
      montres++;
      boutonIndice.lastChild.textContent = montres < indices.length ? `Afficher un indice (${montres}/${indices.length})` : 'Tous les indices sont affichés';
      boutonIndice.disabled = montres >= indices.length;
    });
  }

  // Aperçu
  let apercu = null;
  if (avecApercu) {
    const etatApercu = $('#etat-apercu', main);
    apercu = new Apercu($('#cadre-apercu', main), ex.type, {
      onLog: (m) => ajouterLog(m.niveau, m.texte, 'aperçu'),
      onEtat: (etat, message) => {
        if (etat === 'chargement') etatApercu.textContent = 'Chargement…';
        else if (etat === 'erreur') etatApercu.textContent = 'Erreur : ' + String(message).split('\n')[0];
        else etatApercu.textContent = "L'aperçu se met à jour quand tu tapes.";
        etatApercu.classList.toggle('texte-erreur', etat === 'erreur');
      },
    });
  }
  const rafraichirApercu = () => {
    if (!apercu) return;
    viderConsole();
    apercu.afficher(editeur.getValue(), ex.apercuFetch);
  };
  const apercuDiffere = debounce(rafraichirApercu, 1200);

  // Éditeur
  const sauver = debounce((code) => prog.sauverCode(p.id, id, code), 400);
  const editeur = await creerEditeur($('#editeur', main), {
    valeur: codeSauve ?? ex.depart,
    type: ex.type,
    auChangement: (code) => { sauver(code); apercuDiffere(); },
    auLancement: () => executerTests(),
  });
  if (apercu) rafraichirApercu();
  $('#bouton-rafraichir', main)?.addEventListener('click', rafraichirApercu);

  // Tests
  const boutonLancer = $('#bouton-lancer', main);
  const panneauTests = $('#panneau-tests', main);
  let enCours = false;

  async function executerTests() {
    if (enCours) return;
    enCours = true;
    boutonLancer.disabled = true;
    boutonLancer.querySelector('span').textContent = 'Tests en cours…';
    montrer('tests');
    panneauTests.innerHTML = html`<p class="chargement-tests"><span class="roue"></span>Préparation de l'environnement… (la première fois, cela prend quelques secondes)</p>`.s;
    const code = editeur.getValue();
    prog.sauverCode(p.id, id, code);
    const resultat = await lancerTests({
      kind: ex.type,
      code,
      tests,
      onPret: () => {
        const txt = panneauTests.querySelector('.chargement-tests');
        if (txt) txt.lastChild.textContent = 'Exécution des tests…';
      },
    });
    enCours = false;
    boutonLancer.disabled = false;
    boutonLancer.querySelector('span').textContent = 'Lancer les tests';
    afficherResultat(resultat);
    if (apercu) rafraichirApercu();
  }

  function afficherResultat(r) {
    if (r.erreurChargement || r.erreurExecution) {
      panneauTests.innerHTML = html`<div class="erreur-bloc"><p><strong>${r.erreurChargement ? 'Chargement impossible' : 'Exécution interrompue'}</strong></p><pre>${r.erreurChargement || r.erreurExecution}</pre></div>`.s;
      return;
    }
    if (r.erreurCompilation) {
      panneauTests.innerHTML = html`<div class="erreur-bloc"><p><strong>Ton code ne compile pas.</strong> Corrige l'erreur de syntaxe ci-dessous, puis relance.</p><pre>${r.erreurCompilation}</pre></div>`.s;
      return;
    }
    const total = r.resultats.length;
    const ok = r.resultats.filter((x) => x.ok).length;
    const tout = ok === total && total > 0;
    if (tout) {
      prog.marquerExercice(p.id, id);
      $('#badge-reussite', main).innerHTML = html`<span class="pastille pastille-ok">${icone('ok')}Réussi</span>`.s;
    }
    panneauTests.innerHTML = html`
      <div class="resume-tests ${tout ? 'ok' : 'ko'}">
        <p><strong>${ok} / ${total}</strong> test${total > 1 ? 's' : ''} réussi${ok > 1 ? 's' : ''}</p>
        ${barre(total ? (ok / total) * 100 : 0, 'Tests réussis')}
      </div>
      ${tout ? html`<div class="bravo">
        <p><strong>Exercice réussi.</strong> Tous les tests passent.</p>
        <div class="hero-actions">
          ${suivant ? html`<a class="bouton bouton-principal" href="#/${p.id}/exercice/${suivant.id}">Exercice suivant ${icone('fleche')}</a>` : ''}
          ${l.tps[0] ? html`<a class="bouton" href="#/${p.id}/tp/${l.tps[0]}">${icone('tp')}Faire le TP</a>` : ''}
          <a class="bouton" href="#/${p.id}">Retour au parcours</a>
        </div>
      </div>` : ''}
      <ol class="tests">
        ${r.resultats.map((t) => html`<li class="test ${t.ok ? 'ok' : 'ko'}">
          <div class="test-ligne">
            <span class="test-icone">${icone(t.ok ? 'ok' : 'ko')}</span>
            <span class="test-nom">${brut(markdownEnLigne(t.nom))}</span>
            <span class="test-duree">${t.duree} ms</span>
          </div>
          ${!t.ok ? html`<pre class="test-message">${t.message}</pre>${t.aide ? html`<p class="test-aide">${icone('ampoule')}<span>${brut(markdownEnLigne(t.aide))}</span></p>` : ''}` : ''}
          ${!t.ok && t.logs && t.logs.length ? html`<details class="test-logs"><summary>Console pendant ce test (${t.logs.length})</summary>
            <ol class="console">${t.logs.map((x) => html`<li class="log log-${x.niveau}"><span>${x.texte}</span></li>`)}</ol></details>` : ''}
        </li>`)}
      </ol>`.s;
    // Console de la dernière exécution des tests
    const logsTests = (r.logs || []);
    if (logsTests.length) {
      viderConsole();
      logsTests.forEach((x) => ajouterLog(x.niveau, x.texte, 'tests'));
    }
  }

  boutonLancer.addEventListener('click', executerTests);

  // Réinitialiser
  $('#bouton-reinit', main).addEventListener('click', () => {
    if (!window.confirm('Remettre le code de départ ? Ton code actuel sera perdu.')) return;
    editeur.setValue(ex.depart);
    prog.effacerCode(p.id, id);
    rafraichirApercu();
  });

  // Solution
  const zoneSolution = $('#zone-solution', main);
  $('#bouton-solution', main).addEventListener('click', () => {
    if (zoneSolution.firstChild) { zoneSolution.innerHTML = ''; return; }
    zoneSolution.innerHTML = html`<div class="solution-confirmation">
      <p><strong>Voir la solution ?</strong> Chercher encore un peu t'aide à retenir. Les indices et les messages des tests peuvent te débloquer.</p>
      <div class="hero-actions">
        <button type="button" class="bouton" data-solution="oui">${icone('oeil')}Oui, montrer</button>
        <button type="button" class="bouton bouton-discret" data-solution="non">Non, je continue</button>
      </div>
    </div>`.s;
  });
  zoneSolution.addEventListener('click', (e) => {
    const choix = e.target.closest('[data-solution]')?.dataset.solution;
    if (choix === 'non') zoneSolution.innerHTML = '';
    if (choix === 'oui') {
      zoneSolution.innerHTML = html`<div class="solution">
        <div class="solution-tete"><strong>Solution</strong>
          <button type="button" class="lien-bouton" data-solution="copier">Remplacer mon code par la solution</button>
          <button type="button" class="lien-bouton" data-solution="non">Masquer</button>
        </div>
        ${brut(blocCode(ex.solution, type.langage))}
      </div>`.s;
    }
    if (choix === 'copier') {
      if (!window.confirm('Remplacer ton code par la solution ?')) return;
      editeur.setValue(ex.solution);
      prog.sauverCode(p.id, id, ex.solution);
      rafraichirApercu();
    }
  });

  const debrancher = brancherSommaire(main, p, { lecon: l.id, exercice: id });
  return () => {
    debrancher();
    if (apercu) apercu.detruire();
    $$('iframe.cadre-cache').forEach((f) => f.remove());
  };
}
