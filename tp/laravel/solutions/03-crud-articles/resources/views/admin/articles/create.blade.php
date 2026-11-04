<x-layout titre="Nouvel article">
    <h1>Nouvel article</h1>

    <form method="POST" action="{{ route('admin.articles.store') }}">
        @csrf

        @include('admin.articles._champs')

        <button type="submit">Créer l'article</button>
    </form>
</x-layout>
