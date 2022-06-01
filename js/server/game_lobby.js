var Game = require('./game_driver.js').Game;

class GameLobby {
  constructor(io) {
    this.socket_room_id = 'lobby-socket';
    this.io = io;
    this.game_instance = new Game(this.io, this.socket_room_id);

    // connected players (mapped by player_id)
    // each player object has { username, socket } and is assigned a
    // unique, sequential player_id by the lobby
    this.players = new Map();

    // id given to most recent player who connected
    this.last_player_id = 0;

    this.game_instance.startGame();
    this.in_game = true;

  }

  // attempts to add the given player object to the game
  // player object should have a socket
  addPlayer(player) {
    console.log("Adding player with username " + player.username);

    // assign the player an in-lobby id
    player.player_id = this.last_player_id++;
    player.socket.player_id = player.player_id;  // TODO: I DON'T THINK WE WANT TO DO THIS
    console.log("Player's id set to " + player.player_id);
    player.connected = true;

    // add player to the player mapping
    this.players.set(player.player_id, player);

    // subscribe socket to the lobby's room
    player.socket.join(this.socket_room_id);

    // notify other players in the room of the new player's data
    player.socket.to(this.socket_room_id).emit('player_joined_lobby',
      { player_id: player.player_id, username: player.username });

    // notify the player they joined the lobby and send relevant data
    player.socket.emit('you_joined_lobby', { lobby_name: this.lobby_name,
      your_id: player.player_id, player_data: this.getPlayerData(),
      min_players: this.min_players, max_players: this.max_players });

    var lobby = this;
    player.socket.on('disconnect', function(socket) {
      console.log('Got disconnect from ' + player.username + '!');
      lobby.removePlayer(player);
    });

    // add player to the game, if it's in progress
    this.game_instance.addPlayer(player);

    // notify lobby that player joined
    // this.callbackHandler(LOBBY_SIGNALS.PLAYER_JOINED);
  }

  removePlayer(player) {  // TODO: NEED A WAY TO RECEIVE A LEAVE SIGNAL
    player.connected = false;

    // notify game instance
    if (this.in_game) {
      this.game_instance.removePlayer(player.player_id);
    }

    // unsubscribe socket from the lobby's room
    player.socket.leave(this.socket_room_id);

    // notify other players
    this.io.to(this.socket_room_id).emit('player_disconnected',
      { player_id: player.player_id });

    // notify lobby that player left
    // this.callbackHandler(LOBBY_SIGNALS.PLAYER_LEFT);

    // TODO: REMOVE PLAYER FROM PLAYERS MAP?
  }

  // returns list of data for connected players:
  // each element is an object { player_id, username }
  getPlayerData() {
    var player_data = [];
    for (var player of this.players.values()) {  // TODO: USE A MAP COMPREHENSION
      if (player.connected) {
        player_data.push({
          player_id: player.player_id,
          username: player.username
        });
      }
    }
    return player_data;
  }
}

module.exports.GameLobby = GameLobby;
