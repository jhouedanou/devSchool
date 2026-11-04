<?php

namespace Tests\Feature;

use App\Models\Article;
use Database\Seeders\ArticleSeeder;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/**
 * TP 02 : Modèle Article et liste.
 * Énoncé : enonces/02-articles-eloquent.md
 * Lancer : php artisan test --filter=Tp02
 */
class Tp02ArticlesEloquentTest extends TestCase
{
    use RefreshDatabase;

    public function test_la_table_articles_a_les_bonnes_colonnes(): void
    {
        $this->assertTrue(Schema::hasTable('articles'), 'La table « articles » n\'existe pas : crée la migration.');

        $this->assertTrue(
            Schema::hasColumns('articles', ['id', 'titre', 'slug', 'contenu', 'publie', 'created_at', 'updated_at']),
            'Il manque une colonne : id, titre, slug, contenu, publie, created_at, updated_at.'
        );
    }

    public function test_on_peut_creer_un_article_avec_create_et_publie_est_un_booleen(): void
    {
        $article = Article::create([
            'titre' => 'Découvrir Eloquent',
            'slug' => 'decouvrir-eloquent',
            'contenu' => 'Eloquent est l’ORM de Laravel.',
            'publie' => 1,
        ]);

        $this->assertDatabaseHas('articles', [
            'titre' => 'Découvrir Eloquent',
            'slug' => 'decouvrir-eloquent',
        ]);

        $this->assertTrue($article->fresh()->publie, 'Ajoute un cast « boolean » sur publie.');
    }

    public function test_le_slug_est_unique(): void
    {
        Article::factory()->create(['slug' => 'meme-slug']);

        $this->expectException(QueryException::class);

        Article::factory()->create(['slug' => 'meme-slug']);
    }

    public function test_la_page_articles_liste_seulement_les_articles_publies(): void
    {
        Article::factory()->create(['titre' => 'Article publié', 'slug' => 'article-publie', 'publie' => true]);
        Article::factory()->create(['titre' => 'Brouillon secret', 'slug' => 'brouillon-secret', 'publie' => false]);

        $this->get('/articles')
            ->assertOk()
            ->assertSee('Article publié')
            ->assertSee('href="'.url('/articles/article-publie').'"', false)
            ->assertDontSee('Brouillon secret');
    }

    public function test_les_articles_sont_affiches_du_plus_recent_au_plus_ancien(): void
    {
        Article::factory()->create(['titre' => 'Article ancien', 'created_at' => now()->subDays(3)]);
        Article::factory()->create(['titre' => 'Article récent', 'created_at' => now()->subDay()]);
        Article::factory()->create(['titre' => 'Article du milieu', 'created_at' => now()->subDays(2)]);

        $this->get('/articles')
            ->assertOk()
            ->assertSeeInOrder(['Article récent', 'Article du milieu', 'Article ancien']);
    }

    public function test_la_page_articles_affiche_un_message_quand_il_n_y_a_aucun_article(): void
    {
        $this->get('/articles')
            ->assertOk()
            ->assertSee('Aucun article pour le moment.');
    }

    public function test_la_page_d_un_article_affiche_son_titre_et_son_contenu(): void
    {
        Article::factory()->create([
            'titre' => 'Les migrations',
            'slug' => 'les-migrations',
            'contenu' => 'Une migration décrit la structure d’une table.',
            'publie' => true,
        ]);

        $this->get('/articles/les-migrations')
            ->assertOk()
            ->assertSee('Les migrations')
            ->assertSee('Une migration décrit la structure d’une table.');
    }

    public function test_un_article_non_publie_ou_inconnu_renvoie_une_404(): void
    {
        Article::factory()->create(['slug' => 'pas-encore-pret', 'publie' => false]);

        $this->get('/articles/pas-encore-pret')->assertNotFound();
        $this->get('/articles/slug-qui-n-existe-pas')->assertNotFound();
    }

    public function test_le_seeder_cree_des_articles_publies_et_des_brouillons(): void
    {
        $this->seed(ArticleSeeder::class);

        $this->assertGreaterThanOrEqual(5, Article::where('publie', true)->count(), 'Le seeder doit créer au moins 5 articles publiés.');
        $this->assertGreaterThanOrEqual(1, Article::where('publie', false)->count(), 'Le seeder doit créer au moins 1 brouillon.');
    }
}
