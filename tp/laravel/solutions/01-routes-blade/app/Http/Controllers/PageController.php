<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

class PageController extends Controller
{
    /**
     * Page /bonjour/{nom} : Laravel passe la valeur de {nom} en paramètre.
     */
    public function bonjour(string $nom): View
    {
        return view('bonjour', ['nom' => $nom]);
    }
}
