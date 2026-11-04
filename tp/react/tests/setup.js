// Chargé avant chaque fichier de test (voir vite.config.js).
import '@testing-library/jest-dom/vitest'; // ajoute toBeInTheDocument(), toBeDisabled()…
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Démonte les composants rendus après chaque test.
afterEach(() => {
  cleanup();
});
