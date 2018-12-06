// module imports
var TextureAtlas = require('./../shared/texture_atlas.js').TextureAtlas;
var Sprite = require('./../shared/sprite.js').Sprite;
var SpriteType = require('./../shared/sprite.js').SpriteType;
var Rect = require('./../shared/rect.js').Rect;
var Spaceship = require('./../shared/spaceship.js').Spaceship;
var AmmoDrop = require('./../shared/ammo_drop.js').AmmoDrop;

/*
Defined GameMode types.
*/
var GameMode = {};
GameMode.UNDEFINED = 0;
GameMode.FREE_FOR_ALL = 1;

/*
Runs the game server-side. Meant to be sub-classed to implement a specific
game mode.
*/
class Game {
  constructor() {
    console.log("Creating Game Instance");

    this.texture_atlas = new TextureAtlas();

    this.map_width = 1000;
    this.map_height = 1000;

    this.game_mode = GameMode.UNDEFINED;

    // id of last connected player
    this.last_player_id = 0;

    // connected players
    // each has a player_id, socket, username, score, kills, deaths
    this.players = [];
    // connected socket instances
    this.sockets = [];
    // spaceships controlled by players
    // id corresponds to player_id controlling it
    this.spaceships = [];
    // bullets that have been fired by the spaceships
    this.bullets = [];
    // power_ups in the game
    this.power_ups = [];

    this.last_update_time = 0;

    this.input_buffer = [];

    this.started = false;

    this.interval_id = 0;
  }

  start() {

  }

  stop() {

  }

  update() {

  }

  // attempts to add a player to the game
  // passes in the socket the player is using to connect
  addPlayer(socket) {
    // initialize
    var player_id = this.last_player_id++;
    var x = this.randomInt(100, this.map_width - 100);
    var y = this.randomInt(100, this.map_height - 100);
    var heading = Math.random() * 2 * Math.PI;

    console.log("Game adding player with " + player_id);

    // create Spaceship instance and add to list
    var ship = new Spaceship(player_id, x, y, this.texture_atlas);
    ship.r_heading = heading;
    ship.r_img_rotation = heading;
    this.spaceships.push(ship);

    // create player instance and add to list
    var player = {
      id: player_id,
      socket: socket,
      username: socket.username,
      score: 0,
      kills: 0,
      deaths: 0
    };

    this.players.push(player);

    // add socket instance to list
    this.sockets.push({socket: socket, player_id: player_id});

    // broadcast new player to other sockets
    socket.broadcast.emit('player_joined', {id: player.id,
      username: player.username, x: ship.x, y: ship.y,
      r_heading: ship.r_heading});

    // register control_input callback: add to control buffer
    socket.on('control_input', function(data) {
      this.queueInput({
        player_id: player_id,
        up_pressed: data.up_pressed,
        down_pressed: data.down_pressed,
        left_pressed: data.left_pressed,
        right_pressed: data.right_pressed,
        space_pressed: data.space_pressed
      });
    });

    // register disconnect callback: remove player
    socket.on('disconnect', function() {
      // broadcast player_disconnect signal to other sockets TODO: ONLY SOCKETS IN THIS GAME
      socket.broadcast.emit('player_disconnect', player_id);

      this.removePlayer(player_id);
    })
  }

  // removes player from the game
  removePlayer(id) {  // TODO
    console.log("Game removing player " + id);
    for (var i = 0; i < this.players.length; i++) {
      if (this.players[i].id == id) {
        this.players[i].destroy = true;
      }
    }
  }

  // should have player_id, up/down/left/right/space pressed fields
  queueInput(player_input) {
    console.log("Queueing Input");
    this.input_buffer.push(player_input);
  }

  randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
  }
}

module.exports.Game = Game;
module.exports.GameMode = GameMode;
