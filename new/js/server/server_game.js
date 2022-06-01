ServerSpaceship = require('./server_spaceship.js').ServerSpaceship;

// Server-side, authoritative backend game.
class ServerGame {

  constructor(server) {
    // Server instance, which is used to communicate with players.
    this.server = server;
    // Set of connected player_ids
    this.player_ids = new Set();
    // Mapping of { player_id -> username }
    this.username_lookup = new Map();
    // Number of players in the game.
    this.num_players = 0;

    this.spaceships = [];
    // this.spaceships_lookup = new Map();

    // Dimensions of the play area
    // this.map_width = 1000;
    // this.map_height = 1000;

    // this.random_seed = 10;

    // timestamp game was last updated at
    // this.last_update_time = 0;
    //
    // // number of milliseconds between control handling
    // this.input_handle_interval = 100;
    // // milliseconds since controls were last handled
    // this.ms_since_input_handled = 0;
    //
    // this.broadcast_state_interval = 90;
    // this.ms_since_state_broadcast = 0;
    //
    // this.ping_interval = 3000;
    // this.ms_since_ping = 0;
    //
    // this.input_buffer = [];

  }

  // Request to add a player with given (player_id, username)
  // to the game.
  addPlayer(player_id, username) {
    // Create spaceship for the player, initialized to random
    // position.   TODO: SELECT FROM PRE-SET SPAWN POINTS?
    var player_ship = new ServerSpaceship(player_id, 100, 100, 0);
    // Add to the spaceships
    this.spaceships.push(player_ship);

    // Gather data to send to the new player.
    var init_state = { 'game_state': this.serializeState(),
                       'your_id': player_id,
                       'your_username': username };

    // Send game state to the new player
    this.server.sendInitialState(player_id, init_state);
    // Announce new player to the other players
    this.server.sendPlayerJoined({ 'player_id': player_id,
                                   'player_ship': player_ship});
  }

  removePlayer(player_id) {
    this.player_ids.remove(player_id);
    this.username_lookup.remove(player_id);
    // Remove player's ship
    for (var i = 0; i < this.spaceships.length; i++) {
      if (this.spaceships[i].player_id == player_id) {
        this.spaceships.splice(i, 1);
        break;
      }
    }
    this.num_players--;
    this.server.sendPlayerDisconnected(player_id);
  }

  // Serializes game state to JSON and returns the JSON object.
  serializeState() {
    var game_state = {};

    game_state.spaceships = [];
    // TODO: BUG: THE R_HEADING FIELD IS NOT BEING SAVED
    for (var spaceship of this.spaceships.values()) {
      game_state.spaceships.push(spaceship.serialize());
    }
    return game_state;
  }
}

module.exports.ServerGame = ServerGame;
