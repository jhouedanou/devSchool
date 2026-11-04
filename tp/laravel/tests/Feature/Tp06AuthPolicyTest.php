<?php

namespace Tests\Feature;

use App\Models\Article;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * TP 06 : Authentification et Policy.
 * Énoncé : enonces/06-auth-policy.md
 * Lancer : php artisan test --filter=Tp06
 */
class Tp06AuthPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_invite_est_redirige_vers_la_page_de_connexion(): void
    {
        $this->get('/mes-articles')->assertRedirect('/connexion');

        $this->assertGuest();
    }

    public function test_la_page_de_connexion_affiche_le_formulaire(): void
    {
        $this->get('/connexion')
            ->assertOk()
            ->assertSee('name="email"', false)
            ->assertSee('name="password"', false);
    }

    public function test_un_utilisateur_peut_se_connecter(): void
    {
        $alice = User::factory()->create(['email' => 'alice@example.com', 'password' => 'secret-alice']);

        $this->post('/connexion', ['email' => 'alice@example.com', 'password' => 'secret-alice'])
            ->assertRedirect('/mes-articles');

        $this->assertAuthenticatedAs($alice);
    }

    public function test_de_mauvais_identifiants_affichent_une_erreur(): void
    {
        User::factory()->create(['email' => 'alice@example.com', 'password' => 'secret-alice']);

        $this->from('/connexion')
            ->post('/connexion', ['email' => 'alice@example.com', 'password' => 'mauvais-mot-de-passe'])
            ->assertRedirect('/connexion')
            ->assertSessionHasErrors(['email' => 'Ces identifiants ne correspondent pas.']);

        $this->assertGuest();
    }

    public function test_un_utilisateur_connecte_peut_se_deconnecter(): void
    {
        $this->actingAs(User::factory()->create())
            ->post('/deconnexion')
            ->assertRedirect('/');

        $this->assertGuest();
    }

    public function test_mes_articles_affiche_seulement_les_articles_de_l_utilisateur(): void
    {
        $alice = User::factory()->create();
        $bob = User::factory()->create();

        Article::factory()->create(['titre' => 'Article écrit par Alice', 'user_id' => $alice->id]);
        Article::factory()->create(['titre' => 'Article écrit par Bob', 'user_id' => $bob->id]);

        $this->actingAs($alice)
            ->get('/mes-articles')
            ->assertOk()
            ->assertSee('Article écrit par Alice')
            ->assertDontSee('Article écrit par Bob');
    }

    public function test_un_article_cree_appartient_a_l_utilisateur_connecte(): void
    {
        $alice = User::factory()->create();

        $this->actingAs($alice)
            ->post('/mes-articles', [
                'titre' => 'Mon carnet de bord',
                'contenu' => 'Aujourd’hui, j’ai écrit ma première policy.',
                'publie' => '1',
            ])
            ->assertRedirect('/mes-articles')
            ->assertSessionHas('succes', 'Article créé.');

        $this->assertDatabaseHas('articles', [
            'slug' => 'mon-carnet-de-bord',
            'user_id' => $alice->id,
        ]);
    }

    public function test_la_policy_autorise_seulement_l_auteur(): void
    {
        $alice = User::factory()->create();
        $bob = User::factory()->create();
        $article = Article::factory()->create(['user_id' => $alice->id]);

        $this->assertTrue($alice->can('update', $article), 'L’auteur doit pouvoir modifier son article.');
        $this->assertTrue($alice->can('delete', $article), 'L’auteur doit pouvoir supprimer son article.');
        $this->assertFalse($bob->can('update', $article), 'Un autre utilisateur ne doit pas pouvoir modifier.');
        $this->assertFalse($bob->can('delete', $article), 'Un autre utilisateur ne doit pas pouvoir supprimer.');
    }

    public function test_l_auteur_peut_modifier_et_supprimer_son_article(): void
    {
        $alice = User::factory()->create();
        $article = Article::factory()->create(['titre' => 'Brouillon d’Alice', 'user_id' => $alice->id]);

        $this->actingAs($alice);

        $this->get("/mes-articles/{$article->id}/edit")
            ->assertOk()
            ->assertSee('value="Brouillon d’Alice"', false);

        $this->put("/mes-articles/{$article->id}", [
            'titre' => 'Article d’Alice terminé',
            'contenu' => 'La version finale de mon article.',
            'publie' => '1',
        ])
            ->assertRedirect('/mes-articles')
            ->assertSessionHas('succes', 'Article modifié.');

        $this->assertDatabaseHas('articles', ['id' => $article->id, 'titre' => 'Article d’Alice terminé']);

        $this->delete("/mes-articles/{$article->id}")
            ->assertRedirect('/mes-articles')
            ->assertSessionHas('succes', 'Article supprimé.');

        $this->assertModelMissing($article);
    }

    public function test_un_autre_utilisateur_recoit_une_erreur_403(): void
    {
        $alice = User::factory()->create();
        $bob = User::factory()->create();
        $article = Article::factory()->create(['titre' => 'Article protégé', 'user_id' => $alice->id]);

        $this->actingAs($bob);

        $this->get("/mes-articles/{$article->id}/edit")->assertForbidden();

        $this->put("/mes-articles/{$article->id}", [
            'titre' => 'Article piraté',
            'contenu' => 'Bob essaie de modifier cet article.',
        ])->assertForbidden();

        $this->delete("/mes-articles/{$article->id}")->assertForbidden();

        $this->assertDatabaseHas('articles', ['id' => $article->id, 'titre' => 'Article protégé']);
    }
}
