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
    this.score_per_kill = 100;

    // id of last connected player
    this.last_player_id = 0;

    // tracks teams of players
    // team_id : { score, kills, deaths }
    this.teams = new Map();
    // "parties" of players connected (basically groups)
    // a party may have a single person in it
    // used for team-creation
    // each party is an array of player_ids
    this.parties = [];
    // maximum number of players allowed in a party
    this.max_party_size = 1;
    // minimum number of players needed to start a game
    this.min_players = 2;
    this.connected_players = 0;
    this.waiting_for_players = false;

    // connected players (player_id, player meta-data)
    // each has a player_id, team_id, socket, username, score, kills, deaths
    this.players = new Map();
    // connected socket instances (player_id, Socket)
    this.sockets = new Map();
    // spaceships controlled by players
    this.spaceships = [];
    // bullets that have been fired by the spaceships
    this.bullets = [];
    // power_ups in the game
    this.power_ups = [];

    this.game_start_time = 0;
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

  // sets the game to joinable
  // game starts once enough players have joined
  openToLobby() {
    this.waiting_for_players = true;
  }

  // gets game ready, once enough players have joined
  // makes calls to form teams, assigns initial positions, broadcasts state
  // starts countdown to game start and calls start() once countdown is over
  runGameSetupAndStart() {
    this.waiting_for_players = false;

    this.formTeams();

    this.initGameState();
    this.broadcastState();

    // runs countdown and then calls startGame()
    this.runGameStartCountdown();
  }

  // assigns team_ids to players and populates the teams datastructure
  // intended to be implemented by GameMode subclasses
  formTeams() {

  }

  // initialize the game state, so the game can be started at any time
  // intended to be implemented by GameMode subclasses
  initGameState() {
    // add some power-ups (TODO: THIS IS JUST FOR TESTING)
    this.power_ups.push(new Powerup(0, 100, 100, this.texture_atlas));
    this.power_ups.push(new Powerup(1, 400, 700, this.texture_atlas));
    this.power_ups.push(new Powerup(2, 600, 300, this.texture_atlas));
    this.power_ups.push(new AmmoDrop(3, 150, 150, this.texture_atlas));
    this.power_ups.push(new AmmoDrop(4, 200, 200, this.texture_atlas));
  }

  // runs countdown for given number of seconds
  // broadcasts 'game_start_countdown' signal every 500 ms
  // TODO: THIS SHOULD BE HANDLED BY THE LOBBY
  runGameStartCountdown(time_sec=10) {
    var ms_left = time_sec * 1000;
    var last_time = Date.now();

    var countdown_id = setInterval(function() {
      var curr_time = Date.now();

      ms_left -= (curr_time - last_time);

      if (ms_left <= 0) {
        // cancel interval timer
        clearInterval(countdown_id);
        // start the game
        this.startGame();
      }

      for (var socket in this.sockets) {
        socket.emit('game_start_countdown', ms_left);
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
    this.interval_id = setInterval(function() {game.update();}, 25);
  }

  update() {
    var curr_time = Date.now();
    var ms_since_update = curr_time - this.last_update_time;

    this.ms_since_input_handled += ms_since_update;

    // time to handle the input_buffer!  TODO: IS THIS WHAT WE WANT?
    if (this.ms_since_input_handled >= this.input_handle_interval) {
      this.ms_since_input_handled = 0;

      this.handleInput();
    }

    this.detectAndHandleCollisions();
    this.updateSprites(ms_since_update);

    this.ms_since_state_broadcast += ms_since_update;

    // time to broadcast game state!
    if (this.ms_since_state_broadcast >= this.broadcast_state_interval) {
      this.ms_since_state_broadcast = 0;
      this.broadcastState();
    }
    this.last_update_time = curr_time;
  }

  // checks for collisions and calls the relevant handleCollision() method
  // for colliding sprites
  detectAndHandleCollisions() {
    // currently only checks collisions between spaceships and others
    for (var i = 0; i < this.spaceships.length; i++) {
      // check spaceships
      for (var j = i + 1; j < this.spaceships.length - 1; j++) {
        // TODO: CHANGE ORDERING OF CASES CHECKED?
        if (this.spaceships[i].collides && this.spaceships[j].collides &&
            this.spaceships[i].team_id != this.spaceships[j].team_id &&
            this.spaceships[i].hitbox.intersects(this.spaceships[j].hitbox)) {
          this.spaceships[i].onCollision(this.spaceships[j]);
          this.spaceships[j].onCollision(this.spaceships[i]);
        }
      }

      // check bullets
      for (var j = 0; j < this.bullets.length; j++) {
        if (this.spaceships[i].collides && this.bullets[j].collides &&
            this.spaceships[i].team_id != this.bullets[j].team_id &&
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
  }

  // updates any game-mode specific things
  // implemented by GameMode subclass
  updateGamemodeLogic() {
    return;
  }

  // handles input in the input_queue since the last update()
  handleInput() {
    // send each input event to the relevant spaceship
    for (input_event in this.input_buffer) {
      this.spaceships.get(input_event.player_id).handleControls(
        ms_since_update, input_event.up_pressed,
        input_event.down_pressed, input_event.left_pressed,
        input_event.right_pressed, input_event.space_pressed);
    }
    this.input_buffer.clear();
  }

  // updates states of all sprites (spaceships, bullets, power-ups)
  // by the given number of milliseconds
  updateSprites(ms_since_update) {
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
  }

  // checks if the game has reached an end condition (win/lose/draw)
  // return true or false
  // implemented by GameMode
  checkGameOver() {
    return false;
  }

  // called when the current round is over
  onGameOver() {

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
  broadcastState() {  // TODO: SPLIT INTO SERIALIZATION FUNCTION?
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

  // stops the update() loop and tells clients the game is closed
  // meant more as an "abnormal termination"
  terminate() {
    // stop the update() function
    clearInterval(this.interval_id);

    // send 'lobby_closed' signal to all connected sockets
    for (var socket in this.sockets.values()) {
      socket.emit('lobby_closed', 'The game was stopped');
    }

    // TODO: RETURN SOCKETS TO MATCH-MAKING, UPDATE PLAYER STATS
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

    this.connected_players++;

    // start game condition
    if (this.waiting_for_players && this.connected_players > this.min_players) {
      this.runGameSetupAndStart();
    }

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
    console.log("Game removing player " + player_id);

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

    this.connected_players--;
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
