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

    // connected players (player_id, player meta-data)
    // each has a player_id, socket, username, score, kills, deaths
    this.players = new Map();
    // connected socket instances (player_id, Socket)
    this.sockets = new Map();
    // spaceships controlled by players
    this.spaceships = [];
    // bullets that have been fired by the spaceships
    this.bullets = [];
    // power_ups in the game
    this.power_ups = [];

    this.last_update_time = 0;

    // number of milliseconds between control handling
    this.input_handle_interval = 100;
    // milliseconds since controls were last handled
    this.ms_since_input_handled = 0;
    this.broadcast_state_interval = 100;
    this.ms_since_state_broadcast = 0;

    this.input_buffer = [];

    this.started = false;

    this.interval_id = 0;
  }

  start() {
    this.last_update_time = Date.now();

    // set update() to run every 25 ms and set interval_id
    var game = this;
    this.interval_id = setInterval(function() {game.update();}, 25);
  }

  stop() {
    // send 'game_stopped' signal TODO

    // stop the update() function
    clearInterval(this.interval_id);
  }

  update() {
    var curr_time = Date.now();
    var ms_since_update = curr_time - this.last_update_time;

    this.ms_since_input_handled += ms_since_update;

    // time to handle the input_buffer!  TODO: IS THIS WHAT WE WANT?
    if (this.ms_since_input_handled >= this.input_handle_interval) {
      this.ms_since_input_handled = 0;

      // send each input event to the relevant spaceship
      for (input_event in this.input_buffer) {
        this.spaceships.get(input_event.player_id).handleControls(
          ms_since_update, input_event.up_pressed,
          input_event.down_pressed, input_event.left_pressed,
          input_event.right_pressed, input_event.space_pressed);
      }
    }

    // collision detection
    for (var i = 0; i < this.spaceships.length; i++) {
      // check spaceships
      for (var j = i + 1; j < this.spaceships.length - 1; j++) {
        if (this.spaceships[i].collides && this.spaceships[j].collides &&
            this.spaceships[i].hitbox.intersects(this.spaceships[j].hitbox)) {
          this.spaceships[i].onCollision(this.spaceships[j]);
          this.spaceships[j].onCollision(this.spaceships[i]);
        }
      }

      // check bullets
      for (var j = 0; j < this.bullets.length; j++) {
        if (this.spaceships[i].collides && this.bullets[j].collides &&
            this.spaceships[i].id != this.bullets[j].shooter_id &&
            this.spaceships[i].hitbox.intersects(this.bullets[j].hitbox)) {
          this.spaceships[i].onCollision(this.bullets[j]);
          this.bullets[j].onCollision(this.spaceships[i]);
        }
      }

      // check power-ups
      for (var j = 0; j < this.power_ups.length; j++) {
        if (this.spaceships[i].collides && this.power_ups[j].collides &&
            this.spaceships[i].hitbox.intersects(this.power_ups[j].hitbox)) {
          this.spaceships[i].onCollision(this.power_ups[j]);
          this.power_ups[j].onCollision(this.spaceships[i]);
        }
      }
    }

    // update spaceships
    for (var i = 0; i < this.spaceships.length; i++) {
      var player_obj = this.spaceships[i];

      if (player_obj.destroy) {
        console.log("Destroying player");
        // TODO: RESPAWN?
        // this.spaceships.splice(i, 1);  // TODO: BETTER WAY. SET DEAD = TRUE
      }
      else {
        player_obj.update(ms_since_update);
        player_obj.move(ms_since_update);

        // add player-created bullets to list
        while (player_obj.bullet_queue.length > 0) {
          this.bullets.push(player_obj.bullet_queue.shift());
        }
      }
    }

    for (var i = 0; i < this.bullets.length; ) {
      var bullet_obj = this.bullets[i];
      bullet_obj.update(ms_since_update);

      // remove bullet if destroy = true
      if (bullet_obj.destroy) {
        console.log("Destroying bullet");
        this.bullets.splice(i, 1);
      }
      else {
        bullet_obj.move(ms_since_update);
        i++;
      }
    }

    // TODO: USE AN updateSprites() function
    for (var i = 0; i < this.power_ups.length; ) {
      var power_up_obj = this.power_ups[i];
      power_up_obj.update(ms_since_update);

      // remove bullet if destroy = true
      if (power_up_obj.destroy) {
        console.log("Destroying power up");  // TODO: DELETE OBJECT?
        this.power_ups.splice(i, 1);
      }
      else {
        power_up_obj.move(ms_since_update);
        i++;
      }
    }

    this.ms_since_state_broadcast += ms_since_update;

    // time to broadcast game state!
    if (this.ms_since_state_broadcast >= this.broadcast_state_interval) {
      this.ms_since_state_broadcast = 0;

      // create object representing game state
      var game_state = {};

      game_state.spaceships = [];
      for (var spaceship in this.spaceships.values()) {
        game_state.spaceships.push({
          id: spaceship.id,
          x: spaceship.x,
          y: spaceship.y,
          speed: spaceship.speed,
          accel: spaceship.accel,
          heading: spaceship.r_heading,
          hp: spaceship.hp,
          full_hp: spaceship.full_hp,
          dead: spaceship.dead
        });
      }

      game_state.bullets = {};
      for (var bullet in this.bullets) {
        game_state.bullets.push({
          id: bullet.id,
          x: bullet.x,
          y: bullet.y,
          speed: bullet.speed,
          accel: bullet.accel,
          heading: bullet.r_heading,
          dead: bullet.dead
        });
      }

      game_state.power_ups = {};
      for (var power_up in this.power_ups) {
        game_state.power_ups.push({
          id: power_up.id,
          x: power_up.x,
          y: power_up.y,
          speed: power_up.speed,
          accel: power_up.accel,
          heading: power_up.r_heading,
          dead: power_up.dead
        });
      }

      for (socket in this.sockets.values()) {
        socket.emit('game_update', game_state);
      }
    }
    this.last_update_time = curr_time;
  }

  // attempts to add a player to the game
  // passes in the socket the player is using to connect
  addPlayer(socket) {
    // initialize
    var player_id = this.last_player_id++;
    var x = this.randomInt(100, this.map_width - 100);
    var y = this.randomInt(100, this.map_height - 100);
    var heading = Math.random() * 2 * Math.PI;

    console.log("Game adding player with username " + socket.username +
      " and id " + player_id);

    // create bullet instance and add to list
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

    // TODO: USE SOCKET ROOM FEATURE

    this.players.set(player_id, player);

    // send 'confirmed' message to player's socket
    socket.emit('game_joined', {msg: 'Hi'});

    // broadcast new player to other sockets
    for (var other_socket in this.sockets.values()) {
      other_socket.emit('player_joined', {id: player_id,
        username: player.username, x: ship.x, y: ship.y,
        r_heading: ship.r_heading});
    }

    // add socket instance to list
    this.sockets.set(player_id, socket);

    var game = this;

    // register control_input callback: add to control buffer
    socket.on('control_input', function(data) {
      game.queueInput({
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
      game.removePlayer(player_id);
    })
  }

  // removes player from the game
  removePlayer(player_id) {  // TODO
    console.log("Game removing player " + id);

    // broadcast player_disconnect signal to other sockets
    for ([id, socket] in this.sockets) {
      if (id !== player_id) {
        socket.emit('player_disconnect', player_id);
      }
    }

    // delete and remove all instances related to player
    for (var i = 0; i < this.spaceships.length; i++) {
      if (this.spaceships[i].id === player_id) {
        delete this.spaceships[i];
        this.spaceships.splice(i, 1);
      }
    }

    this.sockets.delete(player_id);

    // TODO: NEED WAY TO SEND STATS TO SERVER
    this.players.delete(player_id);
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
