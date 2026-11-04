<x-layout titre="Connexion">
    <h1>Connexion</h1>

    <form method="POST" action="{{ route('connexion') }}">
        @csrf

        <div class="champ">
            <label for="email">Adresse e-mail</label>
            <input type="email" id="email" name="email" value="{{ old('email') }}" required autofocus>
            @error('email')
                <p class="erreur">{{ $message }}</p>
            @enderror
        </div>

        <div class="champ">
            <label for="password">Mot de passe</label>
            <input type="password" id="password" name="password" required>
            @error('password')
                <p class="erreur">{{ $message }}</p>
            @enderror
        </div>

        <div class="champ">
            <label>
                <input type="checkbox" name="souvenir" value="1">
                Rester connecté
            </label>
        </div>

        <button type="submit">Se connecter</button>
    </form>
</x-layout>
