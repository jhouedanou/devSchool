<x-layout titre="Mes articles">
    <h1>Mes articles</h1>

    <p><a class="bouton" href="{{ route('mes-articles.create') }}">Écrire un article</a></p>

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
                        @can('update', $article)
                            <a href="{{ route('mes-articles.edit', $article) }}">Modifier</a>
                        @endcan
                        @can('delete', $article)
                            <form method="POST" action="{{ route('mes-articles.destroy', $article) }}"
                                  onsubmit="return confirm('Supprimer cet article ?')">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="danger">Supprimer</button>
                            </form>
                        @endcan
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="4">Tu n'as pas encore écrit d'article.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
</x-layout>
