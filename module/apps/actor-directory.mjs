const { ActorDirectory } = foundry.applications.sidebar.tabs;

/**
 * Onglet Acteurs : Foundry n'autorise le glisser d'un acteur qu'avec le droit « Créer des tokens », que les joueurs
 * n'ont pas par défaut. Ici, un joueur peut aussi glisser les acteurs dont il est **observateur ou propriétaire**
 * (suivi de l'auteur, n° 25) — pour les déposer sur un équipage, un poste de vaisseau, une fiche… Poser un token sur
 * la carte reste soumis au droit de Foundry.
 */
export class GalacticWarsActorDirectory extends ActorDirectory {
  /** @override */
  _canDragStart(selector) {
    return true;
  }

  /** @override */
  _onDragStart(event) {
    const id = event.currentTarget?.dataset?.entryId;
    const acteur = id ? this.collection.get(id) : null;
    if (acteur && !game.user.can("TOKEN_CREATE") && !acteur.testUserPermission(game.user, "OBSERVER")) {
      event.preventDefault();
      return false;
    }
    return super._onDragStart(event);
  }
}
