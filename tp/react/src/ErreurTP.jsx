import { Component } from 'react';

// Attrape les erreurs d'un TP pour que le reste de la galerie continue de marcher.
// (Les « error boundaries » sont le seul cas où React demande encore une classe.)
export default class ErreurTP extends Component {
  state = { erreur: null };

  static getDerivedStateFromError(erreur) {
    return { erreur };
  }

  render() {
    if (this.state.erreur) {
      return (
        <div className="erreur-tp" role="alert">
          <p>
            <strong>Ce TP plante pour l'instant.</strong>
          </p>
          <pre>{String(this.state.erreur.message ?? this.state.erreur)}</pre>
          <button type="button" onClick={() => this.setState({ erreur: null })}>
            Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
