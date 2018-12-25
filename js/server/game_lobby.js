var Game = require('game_driver.js').Game;

var LOBBY_SIGNALS = {};
LOBBY_SIGNALS.PLAYER_JOINED = 'player_joined';
LOBBY_SIGNALS.PLAYER_LEFT = 'player_left';
LOBBY_SIGNALS.COUNTDOWN_FINISHED = 'countdown_finished';
LOBBY_SIGNALS.GAME_FINISHED = 'game_finished';

/*
A game lobby manages a group of players while they are waiting for a game
to start, and then runs the game instance for them.
TODO: Run on a separate process.
// Event-oriented
*/
class GameLobby {
  constructor(lobby_name) {
    console.log("Creating Game Lobby with name '" + lobby_name + "'");
    this.socket_room_id = lobby_name + '-lobby-socket';

    this.last_game = null;
    this.game_instance = new Game();

    // connected players (mapped by player_id)
    // each player object has { player_id, username, socket }
    this.players = {};
    this.sockets = [];

    // number of players connected
    this.num_players = 0;
    // whether a game is currently in progress
    this.in_game = false;

    this.min_players = 1;
    this.max_players = 10;
    this.waiting_for_players = true;
    // this.game_started = false;
    // this.terminate = false;
  }

  // responds to events and manages the game
  callbackHandler(lobby_signal) {
    switch (lobby_signal) {

      case LOBBY_SIGNALS.PLAYER_JOINED:
        // start game countdown if minimum player count is now reached
        if (this.waiting_for_players && this.num_players >= this.min_players) {
          this.waiting_for_players = false;
          this.runStartGameCountdown(this.callbackHandler, 20);
        }
        break;

      case LOBBY_SIGNALS.PLAYER_LEFT:

        break;

      case LOBBY_SIGNALS.COUNTDOWN_FINISHED:
        // add player objects to the game, begin setup
        for (var player in this.players) {
          this.game_instance.addPlayer(player);
        }

        this.game_instance.runGameSetupAndStart();

        this.in_game = true;
        break;

      case LOBBY_SIGNALS.GAME_FINISHED:  // TODO: SEND STATS BACK, KEEP STATS AROUND
        this.in_game = false;

        // check enough players are still in-lobby:
        // not enough: set to waiting
        if (this.num_players < this.min_players) {
          this.waiting_for_players = true;
        }
        // enough players: create a new game instance and start countdown
        // to next game
        else
          if (this.last_game !== null) {
            delete this.last_game;
          }
          this.last_game = this.game_instance;
          this.game_instance = new Game();

          this.runStartGameCountdown(this.callbackHandler, 20);
        }
        break;
    }
  }

  // attempts to add the given player object to the game
  addPlayer(player) {
    if (this.num_players === this.max_players) {
      return { accepted: false, reason: 'Lobby is full' };
    }

    // add player to the player mapping
    this.players.set(player.player_id, player);
    this.num_players++;

    // subscribe socket to the lobby's room
    player.socket.join(this.socket_room_id);

    // notify other players of the new player's data
    io.to(this.socket_room_id).emit('player_joined', { id: player_id,
      username: player.user_name });

    // add player to the game, if it's in progress
    if (this.in_game) {
      this.game_instance.addPlayer(player);
    }

    // notify lobby that player joined
    this.callbackHandler(LOBBY_SIGNALS.PLAYER_JOINED);

    return { accepted: true };
  }

  removePlayer(player) {  // TODO: NEED A WAY TO RECEIVE A LEAVE SIGNAL
    this.num_players--;

    // unsubscribe socket from the lobby's room
    player.socket.leave(this.socket_room_id);

    // notify other players
    io.to(this.socket_room_id).emit('player_left', { id: player_id });

    // notify lobby that player left
    this.callbackHandler(LOBBY_SIGNALS.PLAYER_LEFT);
  }

  // starts a timer that broadcasts ms_left until game start
  // asynchronous!! calls the provided callback once time reaches zero
  runStartGameCountdown(on_finished_callback, time_sec=20) {
    var ms_left = time_sec * 1000;
    var last_time = Date.now();

    var countdown_id = setInterval(function() {
      var curr_time = Date.now();

      ms_left -= (curr_time - last_time);

      if (ms_left <= 0) {
        // cancel interval timer
        clearInterval(countdown_id);
        // call on_finished_callback('start_countdown_over')
        on_finished_callback('start_countdown_over');
      }

      io.to(this.socket_room_id).emit('game_start_countdown', ms_left);

      last_time = curr_time;
    }, 500);
  }

  return;
}

module.exports.Lobby = Lobby;
