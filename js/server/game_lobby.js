var Game = require('game_driver.js').Game;

/*
A game lobby manages a group of players while they are waiting for a game
to start, and then runs the game instance for them.
TODO: Run on a separate process.
*/
class GameLobby {
  constructor() {
    console.log("Creating Game Lobby");

    this.next_game = new Game();

    // connected players
    // each player object has { player_id, username }
    this.players = [];
    //
    this.sockets = new Map();

    this.num_players = 0;

    this.waiting_for_players = true;
    this.in_game = false;
    this.terminate = false;
  }

  startLobby() {
    while (!this.terminate) {
      waitForPlayers(function() {
        runStartGameCountdown(function() {
          this.next_game.onGameOver = function() {

          };
        });
      });
    }

    this.next_game.onGameOver = 
  }

  waitForPlayers(on_ready_callback) {

  }

  runStartGameCountdown(on_finished_callback) {

  }
}

module.exports.Lobby = Lobby;
