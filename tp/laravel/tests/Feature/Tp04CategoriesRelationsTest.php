<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\Categorie;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * TP 04 : Catégories et relations.
 * Énoncé : enonces/04-categories-relations.md
 * Lancer : php artisan test --filter=Tp04
 */
class Tp04CategoriesRelationsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Une relation chargée « en retard » dans une boucle (problème N+1) déclenche une erreur.
        Model::preventLazyLoading();
    }

    protected function tearDown(): void
    {
        Model::preventLazyLoading(false);

        parent::tearDown();
    }

    public function test_une_categorie_a_un_nom_et_un_slug(): void
    {
        Categorie::create(['nom' => 'Laravel', 'slug' => 'laravel']);

        $this->assertDatabaseHas('categories', ['nom' => 'Laravel', 'slug' => 'laravel']);
    }

    public function test_le_slug_d_une_categorie_est_unique(): void
    {
        Categorie::create(['nom' => 'Laravel', 'slug' => 'laravel']);

        $this->expectException(QueryException::class);

        Categorie::create(['nom' => 'Laravel bis', 'slug' => 'laravel']);
    }

    public function test_un_article_appartient_a_une_categorie(): void
    {
        $categorie = Categorie::factory()->create();
        $article = Article::factory()->for($categorie)->create();

        $this->assertInstanceOf(BelongsTo::class, $article->categorie());
        $this->assertTrue($article->categorie->is($categorie));
    }

    public function test_une_categorie_a_plusieurs_articles(): void
    {
        $categorie = Categorie::factory()->create();
        Article::factory(2)->for($categorie)->create();
        Article::factory()->create();

        $this->assertInstanceOf(HasMany::class, $categorie->articles());
        $this->assertCount(2, $categorie->articles);
    }

    public function test_un_article_peut_ne_pas_avoir_de_categorie(): void
    {
        $article = Article::create([
            'titre' => 'Sans catégorie',
            'slug' => 'sans-categorie',
            'contenu' => 'Cet article n’a pas de catégorie.',
            'publie' => true,
        ]);

        $this->assertNull($article->fresh()->categorie);
    }

    public function test_la_page_d_une_categorie_liste_ses_articles_publies(): void
    {
        $laravel = Categorie::factory()->create(['nom' => 'Laravel', 'slug' => 'laravel']);
        $vue = Categorie::factory()->create(['nom' => 'Vue', 'slug' => 'vue']);

        Article::factory()->for($laravel)->create(['titre' => 'Les routes Laravel', 'publie' => true]);
        Article::factory()->for($laravel)->create(['titre' => 'Brouillon Laravel', 'publie' => false]);
        Article::factory()->for($vue)->create(['titre' => 'Les composants Vue', 'publie' => true]);

        $this->get('/categories/laravel')
            ->assertOk()
            ->assertSeeInOrder(['<h1', 'Laravel', '</h1>'], false)
            ->assertSee('Les routes Laravel')
            ->assertDontSee('Brouillon Laravel')
            ->assertDontSee('Les composants Vue');
    }

    public function test_une_categorie_inconnue_renvoie_une_404(): void
    {
        $this->get('/categories/categorie-inconnue')->assertNotFound();
    }

    public function test_la_page_des_categories_affiche_le_nombre_d_articles_publies(): void
    {
        $laravel = Categorie::factory()->create(['nom' => 'Laravel', 'slug' => 'laravel']);
        Categorie::factory()->create(['nom' => 'Vue', 'slug' => 'vue']);

        Article::factory(2)->for($laravel)->create(['publie' => true]);
        Article::factory()->for($laravel)->create(['publie' => false]);

        $this->get('/categories')
            ->assertOk()
            ->assertSeeText('Laravel (2)')
            ->assertSeeText('Vue (0)')
            ->assertSee('href="'.url('/categories/laravel').'"', false);
    }

    public function test_la_liste_des_articles_affiche_la_categorie_sans_requetes_n_plus_1(): void
    {
        $laravel = Categorie::factory()->create(['nom' => 'Laravel', 'slug' => 'laravel']);
        $vue = Categorie::factory()->create(['nom' => 'Vue', 'slug' => 'vue']);

        Article::factory()->for($laravel)->create(['titre' => 'Article A']);
        Article::factory()->for($vue)->create(['titre' => 'Article B']);
        Article::factory()->create(['titre' => 'Article C']);

        // Échoue avec une erreur 500 si la vue charge la catégorie sans with('categorie').
        $this->get('/articles')
            ->assertOk()
            ->assertSee('Article A')
            ->assertSee('Laravel')
            ->assertSee('Vue');
    }

    public function test_le_formulaire_admin_permet_de_choisir_une_categorie(): void
    {
        $categorie = Categorie::factory()->create(['nom' => 'Outils', 'slug' => 'outils']);

        $this->get('/admin/articles/create')
            ->assertOk()
            ->assertSee('name="categorie_id"', false)
            ->assertSee('Outils');

        $this->post('/admin/articles', [
            'titre' => 'Article avec catégorie',
            'contenu' => 'Un contenu assez long pour être valide.',
            'categorie_id' => $categorie->id,
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('articles', [
            'slug' => 'article-avec-categorie',
            'categorie_id' => $categorie->id,
        ]);

        $this->post('/admin/articles', [
            'titre' => 'Catégorie inventée',
            'contenu' => 'Un contenu assez long pour être valide.',
            'categorie_id' => 999,
        ])->assertSessionHasErrors('categorie_id');
    }
}
