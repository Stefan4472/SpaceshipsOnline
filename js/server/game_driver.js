// module imports
var TextureAtlas = require('./../shared/texture_atlas.js').TextureAtlas;
var Sprite = require('./../shared/sprite.js').Sprite;
var SpriteType = require('./../shared/sprite.js').SpriteType;
var Rect = require('./../shared/rect.js').Rect;
var Spaceship = require('./../shared/spaceship.js').Spaceship;
var AmmoDrop = require('./../shared/ammo_drop.js').AmmoDrop;
var Powerup = require('./../shared/powerup.js').Powerup;

/*
Defined GameMode types.
*/
var GameMode = {};
GameMode.UNDEFINED = 0;
GameMode.FREE_FOR_ALL = 1;

/*
Runs the game server-side. Meant to be sub-classed to implement a specific
game mode.

Usage:
1. Create Game instance via GameMode child
2. Set the onGameOverCallback() callback
3. Add all players from lobby
4. prepareGame()
5. countdownAndStart()
6. Wait for onGameOverCallback()
7. Retrieve stats and destroy game instance

CURRENT SIMPLIFICATIONS:
COLLISION-DETECTION DONE SERVER-SIDE ONLY
CREATING OF BULLETS DONE SERVER-SIDE ONLY
*/
class Game {
  // constructor takes the GameMode as well as the id for the socket "room"
  // created by the lobby. All sockets passed in should be subscribed to
  // the room.
  // you can also specify the callback function to be called when the game is over
  constructor(io, socket_room_id, game_mode, on_game_over=null) {
    console.log("Creating Game Instance");

    this.io = io;
    this.socket_room_id = socket_room_id;
    this.game_mode = game_mode;
    this.onGameOverCallback = on_game_over;

    this.texture_atlas = new TextureAtlas();

    this.map_width = 1000;
    this.map_height = 1000;

    this.score_per_kill = 100;

    // minimum number of players needed to start a game
    this.min_players = 2;
    this.max_players = 10;
    // number of currently connected/active players
    this.num_players = 0;

    // tracks teams of players
    // team_id : { score, kills, deaths }
    this.teams = new Map();
    // "parties" of players connected (basically groups)
    // a party may have a single person in it
    // used for team-creation
    // each party is an array of player_ids
    this.parties = [];  // TODO
    // maximum number of players allowed in a party
    this.max_party_size = 1;

    // connected players (player_id: player meta-data)
    // each has a player_id, team_id, socket, username, score, kills, deaths
    this.players = new Map();

    // spaceships controlled by players
    this.spaceships = [];
    // bullets that have been fired by the spaceships
    this.bullets = [];
    // power_ups in the game
    this.power_ups = [];

    /* The following track changes in game state since the last update */
    this.new_spaceships = [];
    this.new_bullets = [];
    this.new_powerups = [];
    // collisions: { sprite_id, sprite_id }
    this.new_collisions = [];
    // deaths: { sprite_id, message }
    this.new_deaths = [];

    // sprite.id given to the last sprite created
    this.last_sprite_id = 0;
    // bullet.id given to the most recent bullet fired
    this.last_bullet_id = 0;
    // powerup.id given to the most recent powerup created
    this.last_powerup_id = 0;

    // timestamp game was started at
    this.game_start_time = 0;
    // timestamp game was last updated at
    this.last_update_time = 0;

    // number of milliseconds between control handling
    this.input_handle_interval = 100;
    // milliseconds since controls were last handled
    this.ms_since_input_handled = 0;

    this.broadcast_state_interval = 90;
    this.ms_since_state_broadcast = 0;

    this.ping_interval = 3000;
    this.ms_since_ping = 0;

    this.input_buffer = [];

    this.terminated = false;

    // numerical id used for last ping request
    // ping_id is used to track when pings were sent out, and increases
    // with each ping sent
    this.last_ping_id = 0;
    // maps ping_id to timestamp the ping was sent at
    this.ping_requests = new Map();
    // max allowed ping
    // ten pings over the allowed limit results in a kick
    this.max_ping = 300;

    this.started = false;

    this.interval_id = 0;
  }

  // makes calls to form teams, initialize game state, and broadcast
  // the initial state
  prepareGame() {
    console.log("Preparing game:");
    this.formTeams();
    this.initGameState();
    // broadcast init state
    this.io.to(this.socket_room_id).emit(
      'init_state', this.serializeState());
    this.sendPings();
  }

  // assigns team_ids to players and populates the teams datastructure
  // intended to be implemented by GameMode subclasses
  formTeams() {
    console.log("Forming teams");
  }

  // initialize the game state, so the game can be started at any time
  // intended to be implemented by GameMode subclasses
  initGameState() {
    console.log("Initializing Game State");
    // add some power-ups (TODO: THIS IS JUST FOR TESTING)
    this.createPowerup(100, 100);
    this.createPowerup(400, 700);
    this.createPowerup(600, 300);
    this.createPowerup(150, 150);
    this.createPowerup(200, 200);
  }

  // runs countdown for given number of seconds
  // broadcasts 'game_start_countdown' signal every 500 ms
  // TODO: THIS SHOULD BE HANDLED BY THE LOBBY
  countdownAndStart(time_sec=1) {
    var ms_left = time_sec * 1000;
    var last_time = Date.now();
    var game = this;

    var countdown_id = setInterval(function() {
      var curr_time = Date.now();

      ms_left -= (curr_time - last_time);

      game.io.to(game.socket_room_id).emit('game_start_countdown', ms_left);
      console.log((ms_left / 1000) + " seconds to GAME start");

      if (ms_left <= 0) {
        // cancel interval timer
        clearInterval(countdown_id);
        // start the game
        game.startGame();
      }

      last_time = curr_time;
    }, 500);
  }

  // gets the update() game loop started
  startGame() {
    this.game_start_time = Date.now();
    this.last_update_time = this.game_start_time;

    // set update() to run every 25 ms and set interval_id
    var game = this;
    this.interval_id = setInterval(function() { game.update(); }, 30);
  }

  update() {
    var curr_time = Date.now();
    var ms_since_update = curr_time - this.last_update_time;

    this.handleInput();
    this.detectAndHandleCollisions();
    this.updateSprites(ms_since_update);
    this.updateGamemodeLogic();

    if (this.checkGameOver()) {
      this.onGameOver();
      // stop updating the game
      clearInterval(this.interval_id);
    }

    this.ms_since_state_broadcast += ms_since_update;

    // time to broadcast game state!
    if (this.ms_since_state_broadcast >= this.broadcast_state_interval) {
      this.ms_since_state_broadcast = 0;

      // broadcast serialized game state
      this.io.to(this.socket_room_id).emit('game_update',
        this.serializeState());

      // clear tracked items
      this.new_spaceships.length = 0;
      this.new_bullets.length = 0;
      this.new_powerups.length = 0;
      this.new_collisions.length = 0;
      this.new_deaths.length = 0;
    }

    this.ms_since_ping += ms_since_update;

    // send pings
    if (this.ms_since_ping >= this.ping_interval) {
      this.ms_since_ping = 0;
      this.sendPings();
    }

    this.last_update_time = curr_time;
  }

  // checks for collisions and calls the relevant handleCollision() method
  // for colliding sprites
  detectAndHandleCollisions() {
    // iterate through player ids
    for (var i = 0; i < this.spaceships.length - 1; i++) {
      var ship = this.spaceships[i];

      if (ship.dead || !ship.collides) {
        continue;
      }

      // check spaceships
      for (var j = i + 1; j < this.spaceships.length; j++) {
        var other_ship = this.spaceships[j];

        if (other_ship.dead || !other_ship.collides) {
          continue;
        }
        if (ship.hitbox.intersects(other_ship.hitbox)) {
          ship.onCollision(other_ship);
          other_ship.onCollision(ship);
          this.new_collisions.push({ id1: ship.id, id2: other_ship.id });
        }
      }

      // check bullets
      for (var j = 0; j < this.bullets.length; j++) {
        var bullet = this.bullets[j];
        if (ship.id !== bullet.shooter_id &&
            ship.hitbox.intersects(bullet.hitbox)) {
          ship.onCollision(bullet);
          bullet.onCollision(ship);
          this.new_collisions.push({ id1: ship.id, id2: bullet.id});
        }
      }

      // check power-ups
      for (var j = 0; j < this.power_ups.length; j++) {
        var powerup = this.power_ups[j];
        if (powerup.collides && ship.hitbox.intersects(powerup.hitbox)) {
          ship.onCollision(powerup);
          powerup.onCollision(ship);
          this.new_collisions.push({ id1: ship.id, id2: powerup.id});
        }
      }
    }
  }

  // updates any game-mode specific things
  // implemented by GameMode subclass
  updateGamemodeLogic() {
    return;
  }

  // handles input in the input_queue since the last update()
  handleInput() {
    // send each input event to the relevant spaceship
    for (var input of this.input_buffer) {
      this.players.get(input.player_id).ship.setInput(
        input.up_pressed, input.down_pressed, input.left_pressed,
        input.right_pressed, input.space_pressed);
    }
    // clear the buffer
    this.input_buffer.length = 0;
  }

  // updates states of all sprites (spaceships, bullets, power-ups)
  // by the given number of milliseconds
  updateSprites(ms_since_update) {
    // update spaceships
    for (var ship of this.spaceships) {
      if (!ship.destroy) {
        ship.update(ms_since_update);
        ship.move(ms_since_update);
      }
    }

    for (var i = 0; i < this.bullets.length; ) {
      var bullet_obj = this.bullets[i];
      bullet_obj.update(ms_since_update);
      // remove bullet if destroy = true
      if (bullet_obj.destroy) {
        this.bullets.splice(i, 1);
      }
      else {
        bullet_obj.move(ms_since_update);
        i++;
      }
    }

    for (var i = 0; i < this.power_ups.length; ) {
      var power_up_obj = this.power_ups[i];
      power_up_obj.update(ms_since_update);
      // remove bullet if destroy = true
      if (power_up_obj.destroy) {
        this.power_ups.splice(i, 1);
      }
      else {
        power_up_obj.move(ms_since_update);
        i++;
      }
    }
  }

  // creates a Spaceship and adds it to the spaceships list
  // returns the id of the created spaceship
  createSpaceship(x, y, heading, player_id) {
    this.last_sprite_id++;
    var game = this;
    var ship = new Spaceship(this.last_sprite_id, player_id, x, y,
      function(shooter_id, bullets_fired, x, y, heading, speed) {
        game.createBullet(shooter_id, bullets_fired, x, y, heading, speed); },
      this.texture_atlas);

    ship.r_heading = heading;
    ship.r_img_rotation = heading;
    this.new_spaceships.push(ship);
    this.spaceships.push(ship);
    return ship;
  }

  // creates a Bullet and adds it to the bullets list
  createBullet(shooter_ship_id, bullets_fired, x, y, heading, speed) {
    this.last_sprite_id++;
    var bullet = new Bullet(this.last_sprite_id, shooter_ship_id, 0,
      bullets_fired, x, y, heading, speed, this.texture_atlas);
    this.new_bullets.push(bullet);
    this.bullets.push(bullet);
    return bullet;
  }

  // creates a powerup sprite and adds it to the mappings
  // TODO: HANDLE DIFFERENT TYPES OF POWERUPS
  createPowerup(x, y) {
    this.last_sprite_id++;
    var powerup = new Powerup(this.last_sprite_id, x, y, this.texture_atlas);
    this.new_powerups.push(powerup);
    this.power_ups.push(powerup);
    return powerup;
  }

  // checks if the game has reached an end condition (win/lose/draw)
  // return true or false
  // implemented by GameMode
  checkGameOver() {
    return false;
  }

  // called when the current round is over
  onGameOver() {
    if (this.onGameOverCallback) {
      this.onGameOverCallback();
    }
    // stop game loop
    clearInterval(this.interval_id);
  }

  // called by a Spaceship instance when it is killed by a Bullet collision
  // passes the id of the ship that was killed, and the bullet's
  // shooter_id (i.e., id of the ship that killed it)
  onPlayerShotDown(killed_id, killer_id) {
    console.log("PLAYER SHOT DOWN LISTENER FIRED");

    var player_killed = this.players.get(killed_id);
    var player_killer = this.players.get(killer_id);

    player_killed.deaths++;
    player_killer.kills++;
    player_killer.score += this.score_per_kill; // TODO: CALCULATE_SCORE() FUNCTION?

    this.teams.get(player_killed.team_id).deaths++;
    this.teams.get(player_killer.team_id).kills++;
    this.teams.get(player_killer.team_id).score += this.score_per_kill;
  }

  // serializes/organizes game state and sends to all connected sockets
  serializeState() {
    var game_state = {};

    game_state.spaceships = [];
    for (var spaceship of this.spaceships.values()) {
      game_state.spaceships.push(spaceship.serialize());
    }

    game_state.bullets = [];
    for (var bullet of this.bullets) {
      game_state.bullets.push(bullet.serialize());
    }

    game_state.power_ups = [];
    for (var power_up of this.power_ups) {
      game_state.power_ups.push(power_up.serialize());
    }

    game_state.collisions = []; // TODO: IS DEEP COPY NECESSARY?
    for (var collision of this.new_collisions) {
      game_state.collisions.push(collision);
    }

    game_state.new_spaceships = [];
    for (var ship of this.new_spaceships) {
      game_state.new_spaceships.push({ id: ship.id, player_id: ship.player_id,
        x: ship.x, y: ship.y });
    }

    game_state.new_bullets = [];
    for (var bullet of this.new_bullets) {
      game_state.new_bullets.push({ id: bullet.id, x: bullet.x, y: bullet.y,
        heading: bullet.r_heading, shooter_id: bullet.shooter_id,
        bullet_num: bullet.bullet_num });
    }

    game_state.new_powerups = [];
    for (var powerup of this.new_powerups) {
      game_state.new_powerups.push({ id: powerup.id, x: powerup.x,
        y: powerup.y });
    }
    return game_state;
  }

  // stops the update() loop
  // it is up to the lobby to tell the clients why the game was stopped
  terminate() {
    // stop the update() function
    clearInterval(this.interval_id);
  }

  // attempts to add a player to the game
  // the player has { player_id, username }
  addPlayer(player) {  // TODO: BRING UP-TO-DATE
    // assign random position for now
    var x = this.randomInt(100, this.map_width - 100);
    var y = this.randomInt(100, this.map_height - 100);
    var heading = Math.random() * 2 * Math.PI;

    console.log("Game adding player with username " + player.username +
      " and id " + player.player_id);

    // create bullet instance and add to list
    var ship = this.createSpaceship(x, y, heading, player.player_id);

    // create extended player instance and add to mapping
    var new_player_obj = {
      id: player.player_id,
      ship: ship,
      socket: player.socket,
      username: player.username,
      score: 0,
      kills: 0,
      deaths: 0,
      connected: true,
      ping: 0,
      pings_over: 0
    };

    // register player
    this.players.set(player.player_id, new_player_obj);

    this.num_players++;

    // broadcast new player data to other sockets
    // player.socket.to(this.socket_room_id).emit('player_joined',
      // { id: player.player_id, username: player.username,
        // x: ship.x, y: ship.y, r_heading: ship.r_heading });

    var game = this;

    // register control_input callback: add to control buffer
    player.socket.on('control_input', function(data) {
      game.queueInput({
        player_id: player.player_id,
        up_pressed: data.up_pressed,
        down_pressed: data.down_pressed,
        left_pressed: data.left_pressed,
        right_pressed: data.right_pressed,
        space_pressed: data.space_pressed
      });
    });

    // register disconnect callback: remove player
    player.socket.on('disconnect', function() {
      game.removePlayer(player.player_id);
    });

    // register ping callback: send to receivePing()
    player.socket.on('ping_response', function(ping_id) {
      game.receivePing(player.player_id, ping_id);
    });
  }

  // removes player from the game
  removePlayer(player_id, reason='') {  // TODO
    console.log("Game removing player " + player_id);

    // get player's socket object
    var socket = this.players.get(player_id).socket;

    // send disconnect signal
    socket.emit('disconnected', reason);

    // broadcast player_disconnect signal to other sockets
    socket.to(this.socket_room_id).emit('player_disconnect', player_id);

    // remove player's spaceship
    this.spaceships.delete(player_id);

    // mark player as disconnected
    this.players.get(player_id).connected = false;

    this.num_players--;

    if (this.num_players < this.min_players) { // TODO: PROBABLY DON'T WANT THIS EXACT FUNCTIONALITY
      this.onGameOver();
    }
  }

  sendPings() {
    this.last_ping_id++;
    console.log("Sending ping with id " + this.last_ping_id);

    this.io.to(this.socket_room_id).emit('ping_request',
      { ping_id: this.last_ping_id });

    // add ping id to the map, with current timestamp
    this.ping_requests.set(this.last_ping_id, Date.now());
  }

  receivePing(player_id, ping_id) {
    console.log("Received ping for player_id " + player_id + " with id " + ping_id);
    var player = this.players.get(player_id);
    var new_ping = Date.now() - this.ping_requests.get(ping_id);
    console.log("Ping was " + new_ping + " ms");
    if (new_ping > this.max_ping) {
      player.pings_over++;
    }

    if (player.pings_over > 10) {
      this.removePlayer(player_id, "Your ping was above the limit for too long. Your internet connection is not working properly, or you might be too far away from the current server :( Please try again in a few minutes!");
    }

    // adjust current calculation for ping
    player.ping = player.ping * 0.6 + new_ping * 0.4;
  }

  // should have player_id, up/down/left/right/space pressed fields
  queueInput(player_input) {
    this.input_buffer.push(player_input);
  }

  randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
  }
}

module.exports.Game = Game;
module.exports.GameMode = GameMode;
