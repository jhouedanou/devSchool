<x-layout titre="Administration des articles">
    <h1>Administration des articles</h1>

    <p><a class="bouton" href="{{ route('admin.articles.create') }}">Nouvel article</a></p>

    <table>
        <thead>
            <tr>
                <th>Titre</th>
                <th>Catégorie</th>
                <th>Statut</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($articles as $article)
                <tr>
                    <td>{{ $article->titre }}</td>
                    <td>{{ $article->categorie?->nom ?? '—' }}</td>
                    <td>{{ $article->publie ? 'Publié' : 'Brouillon' }}</td>
                    <td class="actions">
                        <a href="{{ route('admin.articles.edit', $article) }}">Modifier</a>
                        <form method="POST" action="{{ route('admin.articles.destroy', $article) }}"
                              onsubmit="return confirm('Supprimer cet article ?')">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="danger">Supprimer</button>
                        </form>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="4">Aucun article.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</x-layout>
