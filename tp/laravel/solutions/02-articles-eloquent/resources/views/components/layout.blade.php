@props(['titre' => 'Mon blog'])

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $titre }} - Mon blog</title>
    <link rel="stylesheet" href="{{ asset('css/blog.css') }}">
</head>
<body>
    <header>
        <nav>
            <a href="{{ route('accueil') }}">Accueil</a>
            <a href="{{ route('articles.index') }}">Articles</a>
            <a href="{{ route('a-propos') }}">À propos</a>
        </nav>
    </header>

    <main>
        {{ $slot }}
    </main>
</body>
</html>
