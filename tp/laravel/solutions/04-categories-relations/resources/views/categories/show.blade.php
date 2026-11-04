<x-layout :titre="$categorie->nom">
    <h1>{{ $categorie->nom }}</h1>

    @forelse ($articles as $article)
        <article>
            <h2>
                <a href="{{ route('articles.show', $article->slug) }}">{{ $article->titre }}</a>
            </h2>
            <p class="meta">Publié le {{ $article->created_at->format('d/m/Y') }}</p>
        </article>
    @empty
        <p>Aucun article dans cette catégorie.</p>
    @endforelse

    <p><a href="{{ route('categories.index') }}">Toutes les catégories</a></p>
</x-layout>
