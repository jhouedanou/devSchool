<x-layout titre="Modifier l'article">
    <h1>Modifier l'article</h1>

    <form method="POST" action="{{ route('admin.articles.update', $article) }}">
        @csrf
        @method('PUT')

        @include('admin.articles._champs')

        <button type="submit">Enregistrer</button>
    </form>
</x-layout>
