<?php

/**
 * Vérifie que les solutions des TP passent tous les tests.
 *
 * Le script :
 *   1. copie le projet dans un dossier temporaire (sans vendor/, node_modules/, .env, base SQLite, caches) ;
 *   2. réutilise le vendor/ du projet sans le copier (liens symboliques + autoload adapté) ;
 *   3. crée un .env à partir de .env.example, avec une clé APP_KEY neuve ;
 *   4. applique les solutions/01-… à 06-… dans l'ordre (les fichiers sont copiés aux mêmes chemins) ;
 *   5. lance « php artisan test » dans la copie.
 * Le code de sortie vaut 0 si tous les tests passent, autre chose sinon.
 *
 * Usage (depuis tp/laravel) :
 *   php verifier-solutions.php                    toutes les solutions, tous les tests
 *   php verifier-solutions.php --jusqua=03        solutions 01 à 03 seulement
 *   php verifier-solutions.php --filter=Tp03      option transmise à « php artisan test »
 *   php verifier-solutions.php --garder           garde le dossier temporaire pour l'inspecter
 *
 * Ton projet n'est jamais modifié : tout se passe dans la copie.
 */

declare(strict_types=1);

$racine = realpath(__DIR__);
$liensCrees = [];

$options = lireOptions(array_slice($argv, 1));

if ($options['aide']) {
    afficherAide();
    exit(0);
}

if (! is_file($racine.'/vendor/autoload.php')) {
    fwrite(STDERR, "Le dossier vendor/ est absent. Lance d'abord : composer install\n");
    exit(1);
}

if (! is_file($racine.'/.env.example')) {
    fwrite(STDERR, "Le fichier .env.example est introuvable.\n");
    exit(1);
}

$solutions = listerSolutions($racine.'/solutions', $options['jusqua']);

$temp = sys_get_temp_dir().DIRECTORY_SEPARATOR.'devschool-tp-laravel-'.bin2hex(random_bytes(4));

echo "Copie du projet dans {$temp}\n";
copierProjet($racine, $temp);

echo "Réutilisation de vendor/ (sans copie)\n";
preparerVendor($racine, $temp, $liensCrees);

creerEnv($temp);

if ($solutions === []) {
    echo "Aucune solution appliquée : on teste le projet de départ.\n";
}

foreach ($solutions as $dossier) {
    echo 'Solution appliquée : '.basename($dossier)."\n";
    copierDossier($dossier, $temp, fn () => true);
}

echo "\nphp artisan test ".implode(' ', $options['transmis'])."\n\n";

$processus = proc_open(
    array_merge([PHP_BINARY, 'artisan', 'test'], $options['transmis']),
    [STDIN, STDOUT, STDERR],
    $tubes,
    $temp,
);

$code = is_resource($processus) ? proc_close($processus) : 1;

if ($options['garder']) {
    echo "\nDossier temporaire gardé : {$temp}\n";
} else {
    supprimerCopie($temp, $liensCrees);
}

echo $code === 0
    ? "\nToutes les solutions passent les tests.\n"
    : "\nAu moins un test échoue (code {$code}).\n";

exit($code === 0 ? 0 : 1);

// ---------------------------------------------------------------------------

/**
 * Sépare nos options de celles transmises à « php artisan test ».
 *
 * @param  list<string>  $arguments
 * @return array{jusqua: ?int, garder: bool, aide: bool, transmis: list<string>}
 */
function lireOptions(array $arguments): array
{
    $options = ['jusqua' => null, 'garder' => false, 'aide' => false, 'transmis' => []];

    foreach ($arguments as $argument) {
        if (preg_match('/^--jusqua=(\d+)$/', $argument, $m)) {
            $options['jusqua'] = (int) $m[1];
        } elseif ($argument === '--garder') {
            $options['garder'] = true;
        } elseif ($argument === '--aide' || $argument === '-h' || $argument === '--help') {
            $options['aide'] = true;
        } else {
            $options['transmis'][] = $argument;
        }
    }

    return $options;
}

function afficherAide(): void
{
    echo <<<'TXT'
    Vérifie que les solutions des TP passent les tests.

      php verifier-solutions.php                 toutes les solutions, tous les tests
      php verifier-solutions.php --jusqua=03     applique seulement les solutions 01 à 03
      php verifier-solutions.php --filter=Tp03   transmet --filter=Tp03 à « php artisan test »
      php verifier-solutions.php --garder        garde le dossier temporaire

    TXT;
}

/**
 * Les dossiers solutions/NN-…, triés, éventuellement limités à NN <= $jusqua.
 *
 * @return list<string>
 */
function listerSolutions(string $dossier, ?int $jusqua): array
{
    $solutions = glob($dossier.'/[0-9][0-9]-*', GLOB_ONLYDIR) ?: [];
    sort($solutions);

    if ($jusqua !== null) {
        $solutions = array_values(array_filter(
            $solutions,
            fn (string $chemin) => (int) substr(basename($chemin), 0, 2) <= $jusqua,
        ));
    }

    return $solutions;
}

/**
 * Copie le projet en laissant de côté ce qui est généré ou propre à ta machine.
 */
function copierProjet(string $source, string $cible): void
{
    $ignores = ['vendor', 'node_modules', '.git', 'solutions', '.phpunit.cache', '.phpunit.result.cache', '.idea', '.vscode'];

    copierDossier($source, $cible, function (string $relatif, bool $estDossier) use ($ignores): bool {
        $morceaux = explode('/', $relatif);

        if (count($morceaux) === 1 && in_array($relatif, $ignores, true)) {
            return false;
        }

        // .env, .env.testing… sont personnels ; .env.example sert de modèle.
        if (count($morceaux) === 1 && str_starts_with($relatif, '.env') && $relatif !== '.env.example') {
            return false;
        }

        // storage/ : on garde l'arborescence et les .gitignore, pas les logs ni les caches.
        if ($morceaux[0] === 'storage' && ! $estDossier && end($morceaux) !== '.gitignore') {
            return false;
        }

        // bootstrap/cache : config, routes et paquets mis en cache sont recalculés.
        if (str_starts_with($relatif, 'bootstrap/cache/') && str_ends_with($relatif, '.php')) {
            return false;
        }

        // Bases SQLite locales : les tests utilisent une base en mémoire.
        if ($morceaux[0] === 'database' && count($morceaux) === 2 && str_contains($relatif, '.sqlite')) {
            return false;
        }

        return ! in_array($relatif, ['public/hot', 'public/build', 'public/storage'], true);
    });
}

/**
 * Copie récursive. $filtre($relatif, $estDossier) décide de ce qui est copié.
 * Les liens symboliques ne sont jamais suivis.
 */
function copierDossier(string $source, string $cible, callable $filtre, string $relatif = ''): void
{
    if (! is_dir($cible) && ! mkdir($cible, 0777, true) && ! is_dir($cible)) {
        throw new RuntimeException("Impossible de créer {$cible}");
    }

    foreach (scandir($source) ?: [] as $nom) {
        if ($nom === '.' || $nom === '..') {
            continue;
        }

        $chemin = $source.DIRECTORY_SEPARATOR.$nom;
        $sousRelatif = $relatif === '' ? $nom : $relatif.'/'.$nom;

        if (is_link($chemin)) {
            continue;
        }

        $estDossier = is_dir($chemin);

        if (! $filtre($sousRelatif, $estDossier)) {
            continue;
        }

        if ($estDossier) {
            copierDossier($chemin, $cible.DIRECTORY_SEPARATOR.$nom, $filtre, $sousRelatif);
        } elseif (! copy($chemin, $cible.DIRECTORY_SEPARATOR.$nom)) {
            throw new RuntimeException("Impossible de copier {$chemin}");
        }
    }
}

/**
 * Crée vendor/ dans la copie : un lien vers chaque paquet du vrai vendor/,
 * plus un autoload.php qui charge App\, Database\ et Tests\ depuis la copie.
 *
 * @param  list<string>  $liensCrees
 */
function preparerVendor(string $racine, string $temp, array &$liensCrees): void
{
    $source = $racine.DIRECTORY_SEPARATOR.'vendor';
    $cible = $temp.DIRECTORY_SEPARATOR.'vendor';
    mkdir($cible);

    foreach (scandir($source) ?: [] as $nom) {
        if ($nom === '.' || $nom === '..' || $nom === 'autoload.php') {
            continue;
        }

        $original = $source.DIRECTORY_SEPARATOR.$nom;
        $lien = $cible.DIRECTORY_SEPARATOR.$nom;

        if (lier($original, $lien)) {
            $liensCrees[] = $lien;
        } elseif (is_dir($original)) {
            // Dernier recours (Windows sans droits de lien) : copie complète, plus lente.
            copierDossier($original, $lien, fn () => true);
        } else {
            copy($original, $lien);
        }
    }

    $autoload = var_export($source.DIRECTORY_SEPARATOR.'autoload.php', true);
    $original = var_export($racine, true);

    file_put_contents($cible.DIRECTORY_SEPARATOR.'autoload.php', <<<PHP
    <?php

    // Généré par verifier-solutions.php.
    // On réutilise le vendor/ du projet, mais les classes du projet viennent de cette copie.
    \$loader = require {$autoload};

    \$copie = dirname(__DIR__);
    \$original = {$original};

    // Sans cela, les tests devinent le dossier du projet à partir de vendor/ : ils prendraient l'original.
    \$_SERVER['APP_BASE_PATH'] = \$_ENV['APP_BASE_PATH'] = \$copie;

    \$espaces = [
        'App\\\\' => 'app',
        'Database\\\\Factories\\\\' => 'database/factories',
        'Database\\\\Seeders\\\\' => 'database/seeders',
        'Tests\\\\' => 'tests',
    ];

    foreach (\$espaces as \$prefixe => \$dossier) {
        \$loader->setPsr4(\$prefixe, [\$copie.'/'.\$dossier]);
    }

    // Si composer a mis des classes du projet dans sa classmap, on les redirige vers la copie.
    \$redirections = [];
    foreach (\$loader->getClassMap() as \$classe => \$fichier) {
        foreach (array_keys(\$espaces) as \$prefixe) {
            if (str_starts_with(\$classe, \$prefixe)) {
                \$reel = realpath(\$fichier);
                if (\$reel !== false && str_starts_with(\$reel, \$original.DIRECTORY_SEPARATOR)) {
                    \$redirections[\$classe] = \$copie.substr(\$reel, strlen(\$original));
                }
            }
        }
    }
    \$loader->addClassMap(\$redirections);

    return \$loader;

    PHP);
}

/**
 * Crée un lien symbolique (ou une jonction sous Windows). Renvoie false en cas d'échec.
 */
function lier(string $original, string $lien): bool
{
    if (@symlink($original, $lien)) {
        return true;
    }

    if (PHP_OS_FAMILY === 'Windows' && is_dir($original)) {
        exec('mklink /J '.escapeshellarg($lien).' '.escapeshellarg($original).' 2>NUL', $sortie, $code);

        return $code === 0 && is_dir($lien);
    }

    return false;
}

/**
 * .env de la copie : .env.example avec une clé APP_KEY neuve.
 */
function creerEnv(string $temp): void
{
    $env = file_get_contents($temp.'/.env.example');
    $cle = 'base64:'.base64_encode(random_bytes(32));
    $env = preg_replace('/^APP_KEY=.*$/m', 'APP_KEY='.$cle, $env, 1, $remplacements);

    if ($remplacements === 0) {
        $env .= "\nAPP_KEY={$cle}\n";
    }

    file_put_contents($temp.'/.env', $env);
}

/**
 * Supprime la copie. Les liens vers vendor/ sont retirés sans jamais être suivis.
 *
 * @param  list<string>  $liensCrees
 */
function supprimerCopie(string $temp, array $liensCrees): void
{
    foreach ($liensCrees as $lien) {
        if (! @unlink($lien) && ! @rmdir($lien)) {
            fwrite(STDERR, "Lien non supprimé, à retirer à la main : {$lien}\n");

            return; // On s'arrête : supprimer la suite pourrait toucher le vrai vendor/.
        }
    }

    supprimer($temp);
}

function supprimer(string $chemin): void
{
    if (is_link($chemin)) {
        @unlink($chemin) || @rmdir($chemin);

        return;
    }

    if (is_dir($chemin)) {
        foreach (scandir($chemin) ?: [] as $nom) {
            if ($nom !== '.' && $nom !== '..') {
                supprimer($chemin.DIRECTORY_SEPARATOR.$nom);
            }
        }

        @rmdir($chemin);

        return;
    }

    @unlink($chemin);
}
