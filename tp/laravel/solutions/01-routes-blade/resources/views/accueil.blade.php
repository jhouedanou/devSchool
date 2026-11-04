<x-layout titre="Accueil">
    <h1>Bienvenue sur mon blog</h1>

    <p>Ce blog sert de terrain d'entraînement pour réapprendre Laravel.</p>

    <p>
        <a href="{{ route('bonjour', ['nom' => 'Alice']) }}">Dire bonjour à Alice</a>
    </p>
</x-layout>
