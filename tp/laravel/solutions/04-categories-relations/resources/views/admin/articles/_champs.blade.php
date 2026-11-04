{{-- Champs communs aux formulaires de création et de modification. $article est absent en création. --}}
<div class="champ">
    <label for="titre">Titre</label>
    <input type="text" id="titre" name="titre" value="{{ old('titre', $article->titre ?? '') }}">
    @error('titre')
        <p class="erreur">{{ $message }}</p>
    @enderror
    @error('slug')
        <p class="erreur">{{ $message }}</p>
    @enderror
</div>

<div class="champ">
    <label for="contenu">Contenu</label>
    <textarea id="contenu" name="contenu">{{ old('contenu', $article->contenu ?? '') }}</textarea>
    @error('contenu')
        <p class="erreur">{{ $message }}</p>
    @enderror
</div>

<div class="champ">
    <label for="categorie_id">Catégorie</label>
    <select id="categorie_id" name="categorie_id">
        <option value="">Aucune</option>
        @foreach ($categories as $categorie)
            <option value="{{ $categorie->id }}" @selected(old('categorie_id', $article->categorie_id ?? null) == $categorie->id)>
                {{ $categorie->nom }}
            </option>
        @endforeach
    </select>
    @error('categorie_id')
        <p class="erreur">{{ $message }}</p>
    @enderror
</div>

<div class="champ">
    <label>
        <input type="checkbox" name="publie" value="1" @checked(old('publie', $article->publie ?? false))>
        Publié
    </label>
</div>
