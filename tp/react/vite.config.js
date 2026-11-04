import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Fausse API pour la galerie (TP 04) : GET /api/utilisateurs
const UTILISATEURS_DEMO = [
  { id: 1, nom: 'Alice Martin', email: 'alice@exemple.fr' },
  { id: 2, nom: 'Bruno Petit', email: 'bruno@exemple.fr' },
  { id: 3, nom: 'Chloé Durand', email: 'chloe@exemple.fr' },
  { id: 4, nom: 'David Moreau', email: 'david@exemple.fr' },
  { id: 5, nom: 'Emma Laurent', email: 'emma@exemple.fr' },
];

function repondreUtilisateurs(req, res) {
  setTimeout(() => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(UTILISATEURS_DEMO));
  }, 600);
}

function apiDemo() {
  return {
    name: 'api-demo',
    configureServer(server) {
      server.middlewares.use('/api/utilisateurs', repondreUtilisateurs);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/utilisateurs', repondreUtilisateurs);
    },
  };
}

// `--mode solution` : '@tp' pointe vers ./solutions au lieu de ./exercices.
export default defineConfig(({ mode }) => {
  const dossier = mode === 'solution' ? 'solutions' : 'exercices';

  return {
    plugins: [react(), apiDemo()],
    resolve: {
      alias: {
        '@tp': fileURLToPath(new URL(`./${dossier}`, import.meta.url)),
      },
    },
    test: {
      environment: 'jsdom',
      include: ['tests/**/*.test.{js,jsx}'],
      setupFiles: ['./tests/setup.js'],
    },
  };
});
