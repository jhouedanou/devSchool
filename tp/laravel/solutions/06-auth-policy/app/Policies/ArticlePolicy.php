<?php

namespace App\Policies;

use App\Models\Article;
use App\Models\User;

// Laravel trouve cette policy tout seul : App\Models\Article -> App\Policies\ArticlePolicy.
class ArticlePolicy
{
    /**
     * Seul l'auteur peut modifier l'article.
     */
    public function update(User $user, Article $article): bool
    {
        return $user->id === $article->user_id;
    }

    /**
     * Seul l'auteur peut supprimer l'article.
     */
    public function delete(User $user, Article $article): bool
    {
        return $user->id === $article->user_id;
    }
}
