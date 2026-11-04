import { Suspense, useEffect, useState } from 'react';
import { TPS } from './tps.js';
import ErreurTP from './ErreurTP.jsx';

const MODE_SOLUTION = import.meta.env.MODE === 'solution';

function idDepuisAdresse() {
  return window.location.hash.replace(/^#\/?/, '');
}

export default function App() {
  const [id, setId] = useState(idDepuisAdresse);

  useEffect(() => {
    const surChangement = () => setId(idDepuisAdresse());
    window.addEventListener('hashchange', surChangement);
    return () => window.removeEventListener('hashchange', surChangement);
  }, []);

  const tp = TPS.find((t) => t.id === id);

  return (
    <div className="galerie">
      <header className="entete">
        <h1>TP React</h1>
        <span className={MODE_SOLUTION ? 'badge badge-solution' : 'badge'}>
          {MODE_SOLUTION ? 'Solutions' : 'Exercices'}
        </span>
      </header>

      <nav aria-label="Travaux pratiques">
        <ul>
          {TPS.map((t) => (
            <li key={t.id}>
              <a href={`#/${t.id}`} aria-current={t.id === id ? 'page' : undefined}>
                <span className="numero">{t.id.slice(0, 2)}</span> {t.titre}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main>
        {tp ? (
          <>
            <h2>
              {tp.titre} <small>niveau {tp.niveau}</small>
            </h2>
            <p className="chemin">
              Fichiers : <code>{MODE_SOLUTION ? 'solutions' : 'exercices'}/{tp.id}/</code> · tests :{' '}
              <code>npm test -- {tp.id}</code>
            </p>
            <div className="scene">
              <ErreurTP key={tp.id}>
                <Suspense fallback={<p>Chargement du TP…</p>}>
                  <tp.Demo />
                </Suspense>
              </ErreurTP>
            </div>
          </>
        ) : (
          <div className="accueil">
            <h2>Bienvenue</h2>
            <p>Choisis un TP dans le menu. La galerie affiche ton code en direct.</p>
            <p>
              Lance les tests dans un autre terminal : <code>npm test</code>.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
