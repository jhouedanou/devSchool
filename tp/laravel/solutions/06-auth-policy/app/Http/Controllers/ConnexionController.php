<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class ConnexionController extends Controller
{
    /**
     * GET /connexion : le formulaire.
     */
    public function create(): View
    {
        return view('connexion');
    }

    /**
     * POST /connexion : vérifie l'e-mail et le mot de passe.
     */
    public function store(Request $request): RedirectResponse
    {
        $identifiants = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ], [
            'email.required' => "L'adresse e-mail est obligatoire.",
            'email.email' => "L'adresse e-mail n'est pas valide.",
            'password.required' => 'Le mot de passe est obligatoire.',
        ]);

        if (! Auth::attempt($identifiants, $request->boolean('souvenir'))) {
            return back()
                ->withErrors(['email' => 'Ces identifiants ne correspondent pas.'])
                ->onlyInput('email');
        }

        // Nouvel identifiant de session : protège contre la fixation de session.
        $request->session()->regenerate();

        // intended() renvoie vers la page demandée avant la connexion, sinon vers /mes-articles.
        return redirect()->intended(route('mes-articles.index'));
    }

    /**
     * POST /deconnexion : ferme la session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return to_route('accueil');
    }
}
