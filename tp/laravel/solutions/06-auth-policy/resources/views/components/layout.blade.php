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
            <a href="{{ route('categories.index') }}">Catégories</a>
            <a href="{{ route('a-propos') }}">À propos</a>
            <a href="{{ route('admin.articles.index') }}">Admin</a>

            @auth
                <a href="{{ route('mes-articles.index') }}">Mes articles</a>
                <form method="POST" action="{{ route('deconnexion') }}">
                    @csrf
                    <button type="submit">Déconnexion</button>
                </form>
            @else
                <a href="{{ route('connexion') }}">Connexion</a>
            @endauth
        </nav>
    </header>

    <main>
        @if (session('succes'))
            <p class="flash" role="status">{{ session('succes') }}</p>
        @endif

        {{ $slot }}
    </main>
</body>
</html>
