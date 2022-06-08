const { Player } = require('./player.js');
var Spaceship = require('./spaceship.js').Spaceship;
var Messages = require('./../shared/messages.js').Messages;

/* Runs the game server-side. */
class Game {
  constructor(io) {
    console.log("Creating Game Instance");
    this.io = io;
    this.game_width = 1000;
    this.game_height = 1000;

    // Map PlayerID to Player instance
    this.players = new Map();
    this.last_player_id = 0;
    // Map SpriteID to Spaceship
    // TODO: generalize to mapping SpriteID to Sprite
    this.spaceships = new Map();
    // SpriteID given to the last sprite created
    this.last_sprite_id = 0;
    // Timestamp game was last updated at
    this.last_update_time = 0;
    // Buffer inputs from players
    // TODO: make into thread-safe queue
    this.input_buffer = [];
    // ID of the update() interval
    this.interval_id = 0;
  }

  startGame() {
    console.log("Starting game");
    // Trigger first update
    var game = this;
    this.last_update_time = Date.now();
    this.interval_id = setInterval(function() { game.update(); }, 30);
  }

  update() {
    var curr_time = Date.now();
    var ms_since_update = curr_time - this.last_update_time;

    this.handleInput();
    // this.detectAndHandleCollisions();
    this.updateSprites(ms_since_update);

    // Broadcast game state
    this.io.emit(Messages.GAME_UPDATE, this.serializeState());

    this.last_update_time = curr_time;
  }

  /* Handle input in the input_queue since the last update() */
  handleInput() {
    for (var input of this.input_buffer) {
      var ship_id = this.players.get(input.player_id).ship_id;
      this.spaceships.get(ship_id).setInput(
        input.up_pressed, 
        input.down_pressed, 
        input.left_pressed,
        input.right_pressed, 
        input.space_pressed
      );
    }
    // Clear the buffer
    this.input_buffer.length = 0;
  }

  /* Update state of all sprites by the given number of milliseconds */
  updateSprites(ms) {
    for (var ship of this.spaceships) {
      if (!ship.destroy) {
        ship.update(ms);
        ship.move(ms);
      }
    }
  }

  createSpaceship(x, y, heading, player_id) {
    // TODO: make thread safe?
    this.last_sprite_id++;
    var id = this.last_sprite_id;
    var ship = new Spaceship(
      id,
      player_id, 
      x, 
      y, 
      heading
    );
    this.spaceships.set(this.last_sprite_id, ship);
    return ship;
  }

  /* Create and return new player */
  newPlayer(socket) {
    var id = this.last_player_id++;

    // Create ship with random position and heading
    var x = this.randomInt(100, this.game_width - 100);
    var y = this.randomInt(100, this.game_height - 100);
    var heading = Math.random() * 2 * Math.PI;
    var ship = this.createSpaceship(x, y, heading, id);

    // Register player
    this.players.set(id, new Player(id, ship.ship_id, socket));

    // Register control_input callback: add to control buffer
    var game = this;
    socket.on(Messages.SEND_INPUT, function(data) {
      game.input_buffer.push({
        player_id: player.player_id,
        up_pressed: data.up_pressed,
        down_pressed: data.down_pressed,
        left_pressed: data.left_pressed,
        right_pressed: data.right_pressed,
        space_pressed: data.space_pressed
      });
    });

    // Register disconnect callback
    socket.on('disconnect', function() {
      game.removePlayer(id);
    });

    socket.emit(Messages.INIT_STATE, { 
      your_id: id, 
      game_width: this.game_width,
      game_height: this.game_height,
    });
  }

  removePlayer(player_id) {
    console.log("Game removing player " + player_id);
    var player = this.players.get(player_id);
    this.spaceships.delete(player.ship_id);
    this.players.delete(player_id);
    // Broadcast player_disconnect signal to all sockets
    // this.io.emit('player_disconnect', player_id);
  }

  /* Serialize and return game state as an object */
  serializeState() {
    var game_state = {};
    game_state.spaceships = [];
    for (var spaceship of this.spaceships.values()) {
      game_state.spaceships.push(spaceship.serialize());
    }
    return game_state;
  }

  randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
  }
}

module.exports.Game = Game;