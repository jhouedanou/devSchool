<x-layout titre="Écrire un article">
    <h1>Écrire un article</h1>

    <form method="POST" action="{{ route('mes-articles.store') }}">
        @csrf

        {{-- Mêmes champs que dans l'administration (TP 03 et 04). --}}
        @include('admin.articles._champs')

        <button type="submit">Créer l'article</button>
    </form>
</x-layout>
