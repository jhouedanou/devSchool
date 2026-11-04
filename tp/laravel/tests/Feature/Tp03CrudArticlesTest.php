<?php

namespace Tests\Feature;

use App\Models\Article;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * TP 03 : CRUD des articles avec validation.
 * Énoncé : enonces/03-crud-articles.md
 * Lancer : php artisan test --filter=Tp03
 */
class Tp03CrudArticlesTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Données valides pour le formulaire, avec des valeurs à remplacer au besoin.
     */
    private function donnees(array $remplacements = []): array
    {
        return array_merge([
            'titre' => 'Mon premier article',
            'contenu' => 'Un contenu assez long pour passer la validation.',
            'publie' => '1',
        ], $remplacements);
    }

    public function test_la_liste_admin_affiche_tous_les_articles_meme_les_brouillons(): void
    {
        Article::factory()->create(['titre' => 'Article en ligne', 'publie' => true]);
        Article::factory()->create(['titre' => 'Article en préparation', 'publie' => false]);

        $this->get('/admin/articles')
            ->assertOk()
            ->assertSee('Article en ligne')
            ->assertSee('Article en préparation');
    }

    public function test_le_formulaire_de_creation_contient_les_champs(): void
    {
        $this->get('/admin/articles/create')
            ->assertOk()
            ->assertSee('action="'.route('admin.articles.store').'"', false)
            ->assertSee('name="titre"', false)
            ->assertSee('name="contenu"', false)
            ->assertSee('name="publie"', false);
    }

    public function test_creer_un_article_genere_le_slug_et_affiche_un_message(): void
    {
        $this->post('/admin/articles', $this->donnees())
            ->assertRedirect('/admin/articles')
            ->assertSessionHas('succes', 'Article créé.');

        $this->assertDatabaseHas('articles', [
            'titre' => 'Mon premier article',
            'slug' => 'mon-premier-article',
            'publie' => true,
        ]);

        $this->get('/admin/articles')->assertSee('Article créé.');
    }

    public function test_le_titre_et_le_contenu_sont_obligatoires(): void
    {
        $this->from('/admin/articles/create')
            ->post('/admin/articles', ['titre' => '', 'contenu' => ''])
            ->assertRedirect('/admin/articles/create')
            ->assertSessionHasErrors([
                'titre' => 'Le titre est obligatoire.',
                'contenu' => 'Le contenu est obligatoire.',
            ]);

        $this->assertDatabaseCount('articles', 0);
    }

    public function test_le_titre_doit_faire_entre_3_et_120_caracteres(): void
    {
        $this->post('/admin/articles', $this->donnees(['titre' => 'ab']))
            ->assertSessionHasErrors(['titre' => 'Le titre doit contenir au moins 3 caractères.']);

        $this->post('/admin/articles', $this->donnees(['titre' => str_repeat('a', 121)]))
            ->assertSessionHasErrors(['titre' => 'Le titre ne doit pas dépasser 120 caractères.']);

        $this->post('/admin/articles', $this->donnees(['titre' => str_repeat('a', 120)]))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseCount('articles', 1);
    }

    public function test_le_contenu_doit_faire_au_moins_10_caracteres(): void
    {
        $this->post('/admin/articles', $this->donnees(['contenu' => 'Trop court']))
            ->assertSessionHasNoErrors();

        $this->post('/admin/articles', $this->donnees(['titre' => 'Un autre titre', 'contenu' => 'Court']))
            ->assertSessionHasErrors(['contenu' => 'Le contenu doit contenir au moins 10 caractères.']);
    }

    public function test_les_erreurs_et_les_anciennes_valeurs_s_affichent_dans_le_formulaire(): void
    {
        $this->followingRedirects()
            ->from('/admin/articles/create')
            ->post('/admin/articles', ['titre' => 'ab', 'contenu' => ''])
            ->assertOk()
            ->assertSee('Le titre doit contenir au moins 3 caractères.')
            ->assertSee('Le contenu est obligatoire.')
            ->assertSee('value="ab"', false);
    }

    public function test_deux_articles_ne_peuvent_pas_avoir_le_meme_titre(): void
    {
        Article::factory()->create(['titre' => 'Titre déjà pris', 'slug' => 'titre-deja-pris']);

        $this->post('/admin/articles', $this->donnees(['titre' => 'Titre déjà pris']))
            ->assertSessionHasErrors(['slug' => 'Un article avec ce titre existe déjà.']);

        $this->assertDatabaseCount('articles', 1);
    }

    public function test_on_peut_modifier_un_article(): void
    {
        $article = Article::factory()->create(['titre' => 'Ancien titre', 'slug' => 'ancien-titre', 'publie' => true]);

        $this->get("/admin/articles/{$article->id}/edit")
            ->assertOk()
            ->assertSee('value="Ancien titre"', false);

        $this->put("/admin/articles/{$article->id}", $this->donnees(['titre' => 'Nouveau titre', 'publie' => '0']))
            ->assertRedirect('/admin/articles')
            ->assertSessionHas('succes', 'Article modifié.');

        $this->assertDatabaseHas('articles', [
            'id' => $article->id,
            'titre' => 'Nouveau titre',
            'slug' => 'nouveau-titre',
            'publie' => false,
        ]);

        // Garder le même titre est permis : l'article ne doit pas entrer en conflit avec lui-même.
        $this->put("/admin/articles/{$article->id}", $this->donnees(['titre' => 'Nouveau titre']))
            ->assertSessionHasNoErrors();
    }

    public function test_on_peut_supprimer_un_article(): void
    {
        $article = Article::factory()->create();

        $this->delete("/admin/articles/{$article->id}")
            ->assertRedirect('/admin/articles')
            ->assertSessionHas('succes', 'Article supprimé.');

        $this->assertModelMissing($article);
    }
}
