<x-layout titre="Bonjour">
    {{-- {{ }} échappe le texte : un nom comme « <b>Zoé » s'affiche tel quel, sans être interprété. --}}
    <h1>Bonjour, {{ $nom }} !</h1>

    <p><a href="{{ route('accueil') }}">Retour à l'accueil</a></p>
</x-layout>
