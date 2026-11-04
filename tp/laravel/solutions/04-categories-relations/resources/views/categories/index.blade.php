<x-layout titre="Catégories">
    <h1>Catégories</h1>

    <ul>
        @forelse ($categories as $categorie)
            {{-- articles_count vient de withCount() dans le contrôleur. --}}
            <li><a href="{{ route('categories.show', $categorie->slug) }}">{{ $categorie->nom }}</a> ({{ $categorie->articles_count }})</li>
        @empty
            <li>Aucune catégorie.</li>
        @endforelse
    </ul>
</x-layout>
