/*
Client-side lobby representation.
Runs the Game state once confirmation from the server is made.
*/
class ClientLobby {
  constructor(canvas) {
    console.log("Client created lobby");
    this.canvas = canvas;

    // create the game instance
    this.game_instance = new Game(canvas);
    // TODO: ONLOAD HANDLER

  }

  onLobbyJoined(data) {
    console.log("Joined a lobby! Data received " + JSON.stringify(data, null, 2));
  }
}
