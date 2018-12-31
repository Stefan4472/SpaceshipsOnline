/*
client-side lobby representation.
Runs the Game state once confirmation from the server is made.
*/
class ClientLobby {
  constructor(canvas, client) {
    console.log("client created lobby");
    this.canvas = canvas;
    this.client = client;

    // create the game instance
    this.game_instance = new Game(canvas);

    // TODO: ONLOAD HANDLER

    // setup socket message handlers
    client.socket.on('you_joined_lobby', this.onLobbyJoined);
    client.socket.on('player_joined_lobby', this.onPlayerJoined);
    client.socket.on('disconnected', this.onDisconnect);
    client.socket.on('player_disconnected', this.onPlayerDisconnected);
    client.socket.on('lobby_start_countdown', this.onLobbyStartCountdown);
    client.socket.on('game_start_countdown', this.onGameStartCountdown);
    client.socket.on('game_update', this.onGameUpdate);
    client.socket.on('ping_request', this.onPingRequest);
    client.socket.on('lobby_closed', this.onLobbyClosed);
  }

  onLobbyJoined(data) {
    console.log("Joined a lobby! Data received " + JSON.stringify(data, null, 2));
  }

  onPlayerJoined(player_data) {
    console.log("A player joined the lobby with id " + player_data.player_id +
      " and username " + player_data.username);
  }

  onDisconnect(reason) {
    console.log("You got disconnected for reason: '" + reason + "'");
  }

  onPlayerDisconnected(data) {
    console.log("Player with username " + data.player_id + " disconnected");
    // game.removePlayer(player_id);
  }

  onLobbyStartCountdown(ms_left) {
    console.log("Lobby starting in " + (ms_left / 1000) + " seconds");
  }

  onGameStartCountdown(ms_left) {
    console.log("Game starting in " + (ms_left / 1000) + " seconds");
  }

  onGameUpdate(game_state) {
    console.log("Received game update");
    console.log("" + JSON.stringify(game_state, null, 2));
  }

  onPingRequest(data) {
    console.log("Received a ping request with id " + data.ping_id);
    client.socket.emit('ping_response', data.ping_id);
  }

  onLobbyClosed(message) {
    console.log("Lobby was closed, reason: '" + message + "'");
  }
}
