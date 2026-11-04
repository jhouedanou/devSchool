import { html, icone, duree, $ } from '../util.js';
import { enonceTp, guideTp } from '../donnees.js';
import * as prog from '../progression.js';
import { rendreMarkdown } from '../markdown.js';
import { filAriane, sommaire, brancherSommaire, pageErreur, niveau } from './commun.js';

export async function vueTp(main, p, id) {
  const t = p.tps.find((x) => x.id === id);
  if (!t) return pageErreur(main, 'TP introuvable', `Il n'y a pas de TP « ${id} » dans le parcours ${p.titre}.`);
  let md;
  try {
    md = await enonceTp(p.id, id);
  } catch {
    md = `# ${t.titre}\n\nL'énoncé de ce TP n'est pas encore disponible. Regarde le dossier \`tp/${p.id}/\` du dépôt.`;
  }
  document.title = `TP : ${t.titre} — ${p.titre} — devSchool`;
  const lecons = p.lecons.filter((l) => l.tps.includes(id));
  const i = p.tps.indexOf(t);
  const suivant = p.tps[i + 1];

  main.innerHTML = html`
  <div class="mise-en-page">
    ${sommaire(p, { tp: id })}
    <article class="article">
      ${filAriane([{ texte: 'Accueil', lien: '#/' }, { texte: p.titre, lien: `#/${p.id}` }, { texte: `TP ${i + 1}` }])}
      <div class="tp-infos">
        <span class="etiquette">${icone('tp')}Travaux pratiques ${i + 1} / ${p.tps.length}</span>
        ${niveau(t.niveau || 1)}
        ${t.duree ? html`<span class="duree">${icone('temps')}${duree(t.duree)}</span>` : ''}
      </div>
      <aside class="encadre encadre-note encadre-tp">
        <p class="encadre-titre">Où coder ?</p>
        <p>Ce TP se fait sur ta machine, dans le dossier <code>tp/${p.id}/</code> du dépôt. Pas encore installé ? Suis le <a href="#/${p.id}/installation">guide d'installation</a>.</p>
        ${lecons.length ? html`<p>Leçon${lecons.length > 1 ? 's' : ''} liée${lecons.length > 1 ? 's' : ''} : ${lecons.map((l, k) => html`${k ? ', ' : ''}<a href="#/${p.id}/lecon/${l.id}">${l.titre}</a>`)}</p>` : ''}
      </aside>
      <div class="prose" id="prose"></div>
      <section class="suite">
        <h2>Tu as fini ?</h2>
        <p>Quand tous les tests du TP passent dans ton terminal, marque-le comme terminé.</p>
        <div id="etat-tp"></div>
      </section>
      <nav class="precedent-suivant" aria-label="TP">
        <a href="#/${p.id}">${icone('retour')}<span><small>Retour</small>${p.titre}</span></a>
        ${suivant ? html`<a class="suivant" href="#/${p.id}/tp/${suivant.id}"><span><small>TP suivant</small>${suivant.titre}</span>${icone('fleche')}</a>` : html`<a class="suivant" href="#/${p.id}/examen"><span><small>Fin des TP</small>Examen final</span>${icone('fleche')}</a>`}
      </nav>
    </article>
  </div>`.s;

  rendreMarkdown(md, $('#prose', main), { base: `tp/${p.id}/enonces/` });

  const etat = $('#etat-tp', main);
  const maj = () => {
    const fait = prog.tpFait(p.id, id);
    etat.innerHTML = fait
      ? html`<p class="tp-fait">${icone('ok')}<strong>TP terminé.</strong> <button type="button" class="lien-bouton" data-action="annuler">Annuler</button></p>`.s
      : html`<button type="button" class="bouton bouton-principal" data-action="terminer">${icone('ok')}Tous les tests passent : j'ai terminé</button>`.s;
  };
  maj();
  etat.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action === 'terminer') prog.marquerTp(p.id, id, true);
    if (action === 'annuler') prog.marquerTp(p.id, id, false);
    maj();
  });

  return brancherSommaire(main, p, { tp: id });
}

export async function vueInstallation(main, p) {
  let md;
  try {
    md = await guideTp(p.id);
  } catch {
    md = `# Installer les TP ${p.titre}\n\nLe projet de TP de ce parcours n'est pas encore disponible.`;
  }
  document.title = `Installer les TP ${p.titre} — devSchool`;
  main.innerHTML = html`
  <div class="mise-en-page">
    ${sommaire(p, {})}
    <article class="article">
      ${filAriane([{ texte: 'Accueil', lien: '#/' }, { texte: p.titre, lien: `#/${p.id}` }, { texte: 'Installer les TP' }])}
      <aside class="encadre encadre-astuce">
        <p class="encadre-titre">Avant de commencer</p>
        <p>Clone le dépôt une seule fois : <code>git clone https://github.com/jhouedanou/devSchool.git</code>. Le projet de ce parcours est dans <code>tp/${p.id}/</code>.</p>
      </aside>
      <div class="prose" id="prose"></div>
    </article>
  </div>`.s;
  rendreMarkdown(md, $('#prose', main), { base: `tp/${p.id}/` });
  return brancherSommaire(main, p, {});
}
