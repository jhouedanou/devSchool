<x-layout :titre="$article->titre">
    <article>
        <h1>{{ $article->titre }}</h1>
        <p class="meta">Publié le {{ $article->created_at->format('d/m/Y') }}</p>

        {{-- nl2br(e(...)) : on échappe d'abord, puis on garde les retours à la ligne. --}}
        <div>{!! nl2br(e($article->contenu)) !!}</div>
    </article>

    <p><a href="{{ route('articles.index') }}">Retour aux articles</a></p>
</x-layout>
