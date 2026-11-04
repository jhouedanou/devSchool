<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * TP 01 : Routes et vues Blade.
 * Énoncé : enonces/01-routes-blade.md
 * Lancer : php artisan test --filter=Tp01
 */
class Tp01RoutesBladeTest extends TestCase
{
    public function test_la_page_d_accueil_affiche_le_titre_du_blog(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSeeInOrder(['<h1', 'Bienvenue sur mon blog', '</h1>'], false);
    }

    public function test_la_page_a_propos_affiche_son_titre(): void
    {
        $this->get('/a-propos')
            ->assertOk()
            ->assertSeeInOrder(['<h1', 'À propos', '</h1>'], false);
    }

    public function test_la_page_bonjour_affiche_le_nom_recu_dans_l_url(): void
    {
        $this->get('/bonjour/Alice')
            ->assertOk()
            ->assertSee('Bonjour, Alice !');
    }

    public function test_le_nom_est_echappe_pour_eviter_le_html_injecte(): void
    {
        $this->get('/bonjour/'.rawurlencode('<b>Zoé'))
            ->assertOk()
            ->assertSee('Bonjour, &lt;b&gt;Zoé !', false)
            ->assertDontSee('<b>Zoé', false);
    }

    public function test_les_routes_sont_nommees(): void
    {
        $this->assertSame(url('/'), route('accueil'));
        $this->assertSame(url('/a-propos'), route('a-propos'));
        $this->assertSame(url('/bonjour/Alice'), route('bonjour', ['nom' => 'Alice']));
    }

    public function test_la_page_bonjour_passe_par_page_controller(): void
    {
        $route = app('router')->getRoutes()->getByName('bonjour');

        $this->assertNotNull($route, 'La route « bonjour » n\'existe pas.');
        $this->assertSame('App\Http\Controllers\PageController@bonjour', $route->getActionName());
    }

    public function test_le_layout_est_un_composant_blade_avec_un_titre_et_un_slot(): void
    {
        $this->assertFileExists(
            resource_path('views/components/layout.blade.php'),
            'Crée le composant resources/views/components/layout.blade.php.'
        );

        $this->blade('<x-layout titre="Essai">Contenu du slot</x-layout>')
            ->assertSee('<title>Essai - Mon blog</title>', false)
            ->assertSee('Contenu du slot');
    }

    public function test_chaque_page_utilise_le_layout_avec_la_navigation(): void
    {
        foreach (['/', '/a-propos', '/bonjour/Alice'] as $url) {
            $this->get($url)
                ->assertOk()
                ->assertSee('<nav', false)
                ->assertSee('href="'.route('accueil').'"', false)
                ->assertSee('href="'.route('a-propos').'"', false);
        }
    }

    public function test_chaque_page_a_son_titre_dans_la_balise_title(): void
    {
        $this->get('/')->assertSee('<title>Accueil - Mon blog</title>', false);
        $this->get('/a-propos')->assertSee('<title>À propos - Mon blog</title>', false);
        $this->get('/bonjour/Alice')->assertSee('<title>Bonjour - Mon blog</title>', false);
    }
}
