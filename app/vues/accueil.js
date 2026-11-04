import { html, brut, icone, pluriel } from '../util.js';
import { tousLesParcours } from '../donnees.js';
import * as prog from '../progression.js';
import { barre } from './commun.js';
import { blocCode } from '../markdown.js';

export async function vueAccueil(main) {
  const liste = await tousLesParcours();
  document.title = 'devSchool — Vue, Nuxt, React, Laravel';

  let etape = null;
  for (const p of liste) {
    const e = prog.prochaineEtape(p);
    if (e) { etape = { ...e, parcours: p }; break; }
  }
  const stats = liste.map((p) => prog.statsParcours(p));
  const total = stats.reduce((s, x) => s + x.total, 0);
  const faits = stats.reduce((s, x) => s + x.faits, 0);
  const global = total ? Math.round((faits / total) * 100) : 0;
  const commence = faits > 0;

  main.innerHTML = html`
  <section class="hero">
    <div class="hero-texte">
      <p class="surtitre">Parcours d'apprentissage</p>
      <h1>Réapprends Vue, Nuxt, React et Laravel</h1>
      <p class="chapo">Des leçons courtes, des quiz, des exercices de code qui se corrigent dans le navigateur et des TP avec de vrais tests. Suis l'ordre : Vue, puis Nuxt, puis React, puis Laravel.</p>
      <div class="hero-actions">
        ${etape ? html`<a class="bouton bouton-principal" href="${etape.lien}" style="--couleur:${etape.parcours.couleur};--sur-couleur:#0b0f14">
          ${icone('lecture')}${commence ? 'Continuer' : 'Commencer'} : ${etape.parcours.titre} — ${etape.titre}</a>` : html`<span class="pastille pastille-ok">${icone('ok')}Tous les parcours sont terminés</span>`}
        <a class="bouton" href="#/progression">${icone('etoile')}Ma progression</a>
      </div>
    </div>
    <div class="hero-progression">
      <p class="hero-pourcentage"><strong>${global}</strong>&nbsp;%</p>
      <p class="discret">de l'ensemble du programme</p>
      ${barre(global, 'Progression globale')}
      <p class="discret">${faits} / ${total} étapes</p>
    </div>
  </section>

  <section class="section">
    <h2>Les 4 parcours</h2>
    <ol class="grille-parcours">
      ${liste.map((p, i) => {
        const s = stats[i];
        return html`<li><a class="carte-parcours" href="#/${p.id}" style="--couleur:${p.couleur}">
          <span class="carte-ordre">${i + 1}</span>
          <div class="carte-parcours-tete">
            <h3>${p.titre}</h3>
            <span class="version">${p.version}</span>
          </div>
          <p>${p.description}</p>
          <p class="discret">${pluriel(s.lecons, 'leçon')} · ${pluriel(s.exercices, 'exercice')} · ${pluriel(s.tps, 'TP', 'TP')}</p>
          <div class="carte-parcours-progression">${barre(s.pourcentage, 'Progression ' + p.titre)}<span>${s.pourcentage} %</span></div>
        </a></li>`;
      })}
    </ol>
  </section>

  <section class="section">
    <h2>Comment ça marche</h2>
    <ol class="etapes">
      <li><span class="etape-icone">${icone('lecon')}</span><div><h3>Lis la leçon</h3><p>10 à 20 minutes. L'essentiel, avec des exemples courts.</p></div></li>
      <li><span class="etape-icone">${icone('quiz')}</span><div><h3>Fais le quiz</h3><p>Il faut 70 % pour le valider. Chaque réponse est expliquée.</p></div></li>
      <li><span class="etape-icone">${icone('code')}</span><div><h3>Code l'exercice</h3><p>Dans le navigateur. Des tests automatiques te disent ce qui marche.</p></div></li>
      <li><span class="etape-icone">${icone('tp')}</span><div><h3>Termine le TP</h3><p>Dans un vrai projet, sur ta machine, avec Vitest ou PHPUnit.</p></div></li>
    </ol>
  </section>

  <section class="section section-installation">
    <div>
      <h2>Travailler en local</h2>
      <p>Les TP se font sur ta machine. Clone le dépôt, puis lance le site et le projet du parcours.</p>
      <ul class="liste-liens">
        ${liste.map((p) => html`<li><a href="#/${p.id}/installation" style="--couleur:${p.couleur}"><span class="point"></span>Installer les TP ${p.titre}</a></li>`)}
      </ul>
    </div>
    <div>${brut(blocCode(`git clone https://github.com/jhouedanou/devSchool.git
cd devSchool
npm run dev        # le site sur http://localhost:8080

cd tp/vue          # puis le projet de TP du parcours
npm install
npm test`, 'bash'))}</div>
  </section>`.s;
}
