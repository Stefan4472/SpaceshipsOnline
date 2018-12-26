var Game = require('./game_driver.js').Game;

var LOBBY_SIGNALS = {};
LOBBY_SIGNALS.PLAYER_JOINED = 'player_joined';
LOBBY_SIGNALS.PLAYER_LEFT = 'player_left';
LOBBY_SIGNALS.COUNTDOWN_FINISHED = 'countdown_finished';
LOBBY_SIGNALS.GAME_OVER = 'game_over';

/*
A game lobby manages a group of players while they are waiting for a game
to start, and then runs the game instance for them.
TODO: Run on a separate process.
// Event-oriented
*/
class GameLobby {
  constructor(lobby_name, game_mode, io) {
    console.log("Creating Game Lobby with name '" + lobby_name + "'");
    this.socket_room_id = lobby_name + '-lobby-socket';
    this.game_mode = game_mode;
    this.io = io;
    this.io.to(this.socket_room_id).emit('hello world');

    this.last_game = null;
    this.game_instance = new Game(this.io, this.socket_room_id,
      this.game_mode, this.onGameOver);

    this.min_players = this.game_instance.min_players;
    this.max_players = this.game_instance.max_players;

    // connected players (mapped by player_id)
    // each player object has { username, socket } and is assigned a
    // unique, sequential player_id by the lobby
    this.players = new Map();

    // id given to last player who connected
    this.last_player_id = 0;

    // number of players connected
    this.num_players = 0;
    // whether a game is currently in progress
    this.in_game = false;

    this.waiting_for_players = true;
  }

  // responds to events and manages the game
  callbackHandler(lobby_signal) {
    console.log("callbackHandler for '" + lobby_signal + "'");
    switch (lobby_signal) {

      case LOBBY_SIGNALS.PLAYER_JOINED:
        console.log("Player joined lobby signal");
        // start game countdown if minimum player count is now reached
        if (this.waiting_for_players && this.num_players >= this.min_players) {
          this.waiting_for_players = false;
          console.log("Min player count reached... Starting game countdown");
          this.runStartGameCountdown(this.callbackHandler);
        }
        break;

      case LOBBY_SIGNALS.PLAYER_LEFT:

        break;

      case LOBBY_SIGNALS.COUNTDOWN_FINISHED:
        console.log("Countdown finished signal... starting game");
        // add player objects to the game, begin setup
        for (var player in this.players.values()) {
          this.game_instance.addPlayer(player);
        }

        this.game_instance.prepareGame();
        this.game_instance.countdownAndStart();

        this.in_game = true;
        break;

      case LOBBY_SIGNALS.GAME_OVER:  // TODO: SEND STATS BACK, KEEP STATS AROUND
        this.in_game = false;
        console.log("Game over signal");
        // check enough players are still in-lobby:
        // not enough: set to waiting
        if (this.num_players < this.min_players) {
          this.waiting_for_players = true;
        }
        // enough players: create a new game instance and start countdown
        // to next game
        else {
          console.log("Starting countdown to next game...");
          this.last_game = this.game_instance;
          this.game_instance = new Game(this.io, this.socket_room_id,
            this.game_mode, this.onGameOver);
          this.game_instance.on_over_callback = this.onGameOver();

          this.runStartGameCountdown(this.callbackHandler);
        }
        break;
    }
  }

  // TODO
  addParty(party) {

  }

  // attempts to add the given player object to the game
  // player object should have a socket
  addPlayer(player) {
    console.log("Adding player with username " + player.username);
    if (this.num_players === this.max_players) {
      return { accepted: false, reason: 'Lobby is full' };
    }

    // assign the player an in-lobby id
    player.player_id = ++this.last_player_id;
    player.socket.player_id = player.player_id;  // TODO: I DON'T THINK WE WANT TO DO THIS

    // add player to the player mapping
    this.players.set(player.player_id, player);
    this.num_players++;

    // subscribe socket to the lobby's room
    player.socket.join(this.socket_room_id);

    // notify other players of the new player's data
    this.io.to(this.socket_room_id).emit('player_joined_lobby',
      { id: player.player_id, username: player.user_name });

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

    // notify game instance
    if (this.in_game) {
      this.game_instance.removePlayer(player.player_id);
    }

    // unsubscribe socket from the lobby's room
    player.socket.leave(this.socket_room_id);

    // notify other players
    this.io.to(this.socket_room_id).emit('player_disconnected',
      { id: player.player_id });

    // notify lobby that player left
    this.callbackHandler(LOBBY_SIGNALS.PLAYER_LEFT);
  }

  // general game-over callback
  // sends the event to the main callbackHandler
  onGameOver() {
    this.callbackHandler(LOBBY_SIGNALS.GAME_OVER);
  }

  // starts a timer that broadcasts ms_left until game start
  // asynchronous!! calls the provided callback once time reaches zero
  runStartGameCountdown(on_finished_callback, time_sec=5) {
    var ms_left = time_sec * 1000;
    var last_time = Date.now();
    var game = this;

    var countdown_id = setInterval(function() {
      var curr_time = Date.now();

      ms_left -= (curr_time - last_time);

      game.io.to(this.socket_room_id).emit('lobby_start_countdown', ms_left);
      console.log((ms_left / 1000) + " seconds to start");

      if (ms_left <= 0) {
        // cancel interval timer
        clearInterval(countdown_id);
        // call on_finished_callback('start_countdown_over')
        // on_finished_callback(LOBBY_SIGNALS.COUNTDOWN_FINISHED);
        game.callbackHandler(LOBBY_SIGNALS.COUNTDOWN_FINISHED);
      }

      last_time = curr_time;
    }, 500);

    return;
  }
}

module.exports.GameLobby = GameLobby;
