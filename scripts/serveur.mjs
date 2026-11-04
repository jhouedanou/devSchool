// Petit serveur statique pour le développement : node scripts/serveur.mjs [port]
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = resolve(fileURLToPath(new URL('..', import.meta.url)));
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8',
};

export function demarrerServeur(port = 0) {
  const serveur = http.createServer(async (req, res) => {
    try {
      let chemin = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (chemin.endsWith('/')) chemin += 'index.html';
      const fichier = normalize(join(RACINE, chemin));
      if (!fichier.startsWith(RACINE)) { res.writeHead(403).end(); return; }
      const s = await stat(fichier).catch(() => null);
      if (!s || !s.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404'); return; }
      res.writeHead(200, { 'Content-Type': TYPES[extname(fichier)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(await readFile(fichier));
    } catch (e) {
      res.writeHead(500).end(String(e));
    }
  });
  return new Promise((ok) => serveur.listen(port, '127.0.0.1', () => ok(serveur)));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2]) || 8080;
  await demarrerServeur(port);
  console.log(`devSchool → http://localhost:${port}`);
}
