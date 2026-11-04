<x-layout titre="Articles">
    <h1>Articles</h1>

    @forelse ($articles as $article)
        <article>
            <h2>
                <a href="{{ route('articles.show', $article->slug) }}">{{ $article->titre }}</a>
            </h2>
            <p class="meta">Publié le {{ $article->created_at->format('d/m/Y') }}</p>
        </article>
    @empty
        <p>Aucun article pour le moment.</p>
    @endforelse
</x-layout>
