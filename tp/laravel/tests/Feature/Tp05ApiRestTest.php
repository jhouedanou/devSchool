<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Categorie;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * TP 05 : API REST JSON.
 * Énoncé : enonces/05-api-rest.md
 * Lancer : php artisan test --filter=Tp05
 */
class Tp05ApiRestTest extends TestCase
{
    use RefreshDatabase;

    public function test_les_routes_de_l_api_commencent_par_api_et_sont_nommees(): void
    {
        $this->assertSame(url('/api/articles'), route('api.articles.index'));
        $this->assertSame(url('/api/articles/5'), route('api.articles.show', 5));

        // Les routes web du TP 02 gardent leurs noms.
        $this->assertSame(url('/articles'), route('articles.index'));
    }

    public function test_la_liste_renvoie_les_articles_pagines_par_10_avec_leur_categorie(): void
    {
        $categorie = Categorie::factory()->create(['nom' => 'Laravel', 'slug' => 'laravel']);
        Article::factory(15)->for($categorie)->create();

        $this->getJson('/api/articles')
            ->assertOk()
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('meta.total', 15)
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('data.0.categorie.nom', 'Laravel')
            ->assertJsonStructure([
                'data',
                'links' => ['first', 'last', 'prev', 'next'],
                'meta' => ['current_page', 'last_page', 'per_page', 'total'],
            ]);

        $this->getJson('/api/articles?page=2')
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('meta.current_page', 2);
    }

    public function test_un_article_expose_seulement_les_champs_choisis(): void
    {
        $categorie = Categorie::factory()->create(['nom' => 'Laravel', 'slug' => 'laravel']);
        $article = Article::factory()->for($categorie)->create([
            'titre' => 'Les ressources API',
            'slug' => 'les-ressources-api',
            'publie' => true,
        ]);

        $this->getJson("/api/articles/{$article->id}")
            ->assertOk()
            ->assertJsonStructure([
                'data' => ['id', 'titre', 'slug', 'contenu', 'publie', 'categorie' => ['id', 'nom', 'slug'], 'cree_le'],
            ])
            ->assertJsonPath('data.id', $article->id)
            ->assertJsonPath('data.titre', 'Les ressources API')
            ->assertJsonPath('data.publie', true)
            ->assertJsonPath('data.categorie.slug', 'laravel')
            ->assertJsonMissingPath('data.created_at')
            ->assertJsonMissingPath('data.updated_at')
            ->assertJsonMissingPath('data.categorie_id');
    }

    public function test_un_article_inexistant_renvoie_une_404_en_json(): void
    {
        $article = Article::factory()->create();

        $this->getJson("/api/articles/{$article->id}")->assertOk();

        $this->getJson('/api/articles/'.($article->id + 1))
            ->assertNotFound()
            ->assertJsonStructure(['message']);
    }

    public function test_creer_un_article_renvoie_201(): void
    {
        $this->postJson('/api/articles', [
            'titre' => 'Nouvel article via API',
            'contenu' => 'Un contenu envoyé en JSON.',
            'publie' => true,
        ])
            ->assertCreated()
            ->assertJsonPath('data.titre', 'Nouvel article via API')
            ->assertJsonPath('data.slug', 'nouvel-article-via-api')
            ->assertJsonPath('data.publie', true);

        $this->assertDatabaseHas('articles', ['slug' => 'nouvel-article-via-api']);
    }

    public function test_une_creation_invalide_renvoie_422_avec_les_erreurs(): void
    {
        $this->postJson('/api/articles', ['titre' => 'ab'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['titre', 'contenu']);

        $this->assertDatabaseCount('articles', 0);
    }

    public function test_modifier_un_article_renvoie_200(): void
    {
        $article = Article::factory()->create(['titre' => 'Titre initial', 'slug' => 'titre-initial']);

        $this->putJson("/api/articles/{$article->id}", [
            'titre' => 'Titre modifié',
            'contenu' => 'Le contenu a changé lui aussi.',
            'publie' => false,
        ])
            ->assertOk()
            ->assertJsonPath('data.titre', 'Titre modifié')
            ->assertJsonPath('data.publie', false);

        $this->assertDatabaseHas('articles', ['id' => $article->id, 'slug' => 'titre-modifie']);
    }

    public function test_supprimer_un_article_renvoie_204(): void
    {
        $article = Article::factory()->create();

        $this->deleteJson("/api/articles/{$article->id}")->assertNoContent();

        $this->assertModelMissing($article);
    }
}
