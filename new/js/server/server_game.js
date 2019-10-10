// Server-side, authoritative backend game.
class ServerGame {

  constructor(server) {
    this.server = server;
  }

  addPlayer(player_id, username) {
    this.server.sendInitialState(player_id, 'blank state');
  }
}

module.exports.ServerGame = ServerGame;
