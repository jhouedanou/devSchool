<x-layout titre="Modifier mon article">
    <h1>Modifier mon article</h1>

    <form method="POST" action="{{ route('mes-articles.update', $article) }}">
        @csrf
        @method('PUT')

        @include('admin.articles._champs')

        <button type="submit">Enregistrer</button>
    </form>
</x-layout>
