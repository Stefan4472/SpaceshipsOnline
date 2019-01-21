  /*
Runs the game.
*/
class Game {
  // creates the game, given the canvas to use for drawing
  constructor(canvas) {
    console.log("Game constructor");
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.screen_width = this.canvas.width;
    this.screen_height = this.canvas.height;

    this.up_pressed = false;
    this.down_pressed = false;
    this.left_pressed = false;
    this.right_pressed = false;
    this.space_pressed = false;

    // whether input has changed since the last time they were
    // broadcast to the server
    this.input_changed = false;

    // TODO: ARE THESE BEING USED?
    this.initialized = false;
    this.started = false;
    this.game_over = false;

    this.texture_atlas_ready = false;
    this.background_ready = false;

    // timestamp the game was last updated
    this.last_update_time = null;

    var _this = this;
    this.texture_atlas = new TextureAtlas();
    this.texture_atlas.onready = function() {
      console.log("Game.js received TextureAtlas onready()");
      _this.texture_atlas_ready = true;
    };
    this.background = new Background(1000, 1000, this.screen_width,
      this.screen_height);
    this.background.onready = function() {
      console.log("Game.js received Background onready()");
      _this.background_ready = true;
    };

    // player's id, given by server
    // corresponds to the player's spaceship id field
    this.player_id = -1;
    // map of player_id : player object. Set in initGameState()
    this.players = null;
    // the player's Spaceship
    this.player_ship = null;

    // spaceship objects, mapped by player_id
    this.spaceships = new Map();
    // bullets fired by players and being tracked TODO: MAKE INTO MAP
    this.bullets = [];
    // power-ups floating around the map  TODO: MAKE INTO MAP
    this.power_ups = [];

    // shows player's head's up display. Initialized in start()
    this.hud_view = null;
  }

  // provides the game with a map of the players (from the parent lobby
  // instance) and gamestate broadcast from the server
  onReceiveInitState(player_id, players, game_state) {
    console.log("Received init state!" + "\n" + JSON.stringify(game_state, null, 2));

    this.player_id = player_id;
    this.players = players;

    // deserialize Spaceship objects and add to mapping
    for (var serialized_ship of game_state.spaceships) {
      var deserialized_ship = new Spaceship(serialized_ship.id,
        serialized_ship.x, serialized_ship.y, this.texture_atlas);
      deserialized_ship.speed = serialized_ship.speed;
      deserialized_ship.accel = serialized_ship.accel;
      deserialized_ship.r_heading = serialized_ship.heading;
      deserialized_ship.r_img_rotation = serialized_ship.heading;
      deserialized_ship.hp = serialized_ship.hp;
      deserialized_ship.full_hp = serialized_ship.full_hp;
      deserialized_ship.dead = serialized_ship.dead;

      this.spaceships.set(serialized_ship.id, deserialized_ship);
      console.log("Set spaceship with id " + serialized_ship.id + ' to ' +
        JSON.stringify(this.spaceships.get(serialized_ship.id), null, 2));
    }

    // TODO: deserialize other objects

    // create reference to the player's Spaceship
    this.player_ship = this.spaceships.get(this.player_id);

    // init head's up display
    this.hud_view = new HeadsUpDisplay(this.player_ship,
      this.screen_width, this.screen_height);

    // print player connect messages to HUD
    for (var player of this.players.values()) {
      this.hud_view.addMessage(player.username + " connected");
    }

    this.initialized = true;

    // set updateAndDraw(), starting the game loop
    var game = this;
    window.requestAnimationFrame(function() { game.updateAndDraw(); });
  }

  onGameStartCountdown(ms_left) {
    // start game logic
    if (ms_left <= 0) {
      this.start();
    }
    // draw number of seconds remaining
    else {
      console.log("Game starting in " + (ms_left / 1000) + " seconds");
    }
  }

  // receive an updated game state
  // currently just snaps the current game state to the provided one
  onGameUpdate(game_state) {
    console.log("Received game update");

    for (var server_ship of game_state.spaceships) {
      // retrieve the specified Spaceships client-side
      var client_ship = this.spaceships.get(server_ship.id);

      client_ship.x = server_ship.x;
      client_ship.y = server_ship.y;
      client_ship.hitbox.x = server_ship.x;
      client_ship.hitbox.y = server_ship.y;
      client_ship.speed = server_ship.speed;
      client_ship.accel = server_ship.accel;
      client_ship.r_heading = server_ship.heading;
      client_ship.r_img_rotation = server_ship.heading;
      client_ship.hp = server_ship.hp;
      client_ship.full_hp = server_ship.full_hp;
      client_ship.dead = server_ship.dead;
    }
  }

  start() {
    console.log("Starting game");
    this.started = true;

    var game = this;

    // add key listeners
    document.addEventListener("keydown", function(e) { game.keyDownHandler(e); }, false);
    document.addEventListener("keyup", function(e) { game.keyUpHandler(e); }, false);
  }

  updateAndDraw() {
    var curr_time = Date.now();

    if (!this.started) {
      this.started = true;
      this.last_update_time = curr_time;
    }

    var ms_since_update = curr_time - this.last_update_time;

    // handle changed input TODO: DO THIS DIRECTLY IN THE KEY LISTENER?
    if (this.input_changed) {
      // send controls to server
      client.sendControls(this.up_pressed, this.down_pressed,
        this.left_pressed, this.right_pressed, this.space_pressed);

      // handle controls pressed by player
      this.player_ship.setInput(this.up_pressed,
        this.down_pressed, this.left_pressed, this.right_pressed,
        this.space_pressed);

      this.input_changed = false;
    }

    // TODO: COLLISION-DETECTION DONE SERVER-SIDE ONLY?

    // update sprites client-side
    for (var ship of this.spaceships.values()) {
       // TODO: HANDLING OF DEAD SHIPS AND RESPAWN
      ship.update(ms_since_update);
      ship.move(ms_since_update);
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

    this.background.center_to(
      this.player_ship.x + this.player_ship.img_width / 2,
      this.player_ship.y + this.player_ship.img_height / 2);

    this.hud_view.update(ms_since_update);

    this.drawGame()

    this.last_update_time = curr_time;

    if (!this.game_over) {
      var _this = this;
      window.requestAnimationFrame(function() { _this.updateAndDraw(); });
    }
  }

  drawGame() {
    this.background.draw(this.ctx, this.texture_atlas);

     // TODO: ONLY DRAW THINGS THAT ARE VISIBLE

    for (var bullet of this.bullets) {
      bullet.draw(this.ctx, this.texture_atlas,
        this.background.view_x, this.background.view_y);
    }

    for (var powerup of this.power_ups) {
      powerup.draw(this.ctx, this.texture_atlas,
        this.background.view_x, this.background.view_y);
    }

    for (var ship of this.spaceships.values()) {
      ship.draw(this.ctx, this.texture_atlas,
        this.background.view_x, this.background.view_y);
    }

    this.hud_view.draw(this.ctx, this.texture_atlas);
  }

// TODO: ONPLAYERCONNECT... BUT SHOULD WE ALLOW JOINING MID-MATCH?
  // addPlayer(id, x, y) {
  //   console.log("Game adding player with id " + id + " at " + x + ", " + y);
  //   // TODO: FIX THIS
  //   this.players.push(
  //     new Spaceship(id, x, y, this.texture_atlas));
  // }

  // called by lobby when a player has been disconnected
  // print message to console and remove player from the game
  onPlayerDisconnected(player_id) {
    console.log("Player with id " + player_id + " disconnected");
    this.hud_view.addMessage(this.players.get(player_id).username +
      " left the game");
    this.spaceships.delete(player_id);
    this.players.delete(player_id);
  }

  // called by the lobby when it is notified the game has reached an
  // end state
  onGameOver() {  // TODO: DISPLAY MESSAGE?
    console.log("Game received onGameover()");
    this.game_over = true;
  }

  // called by the lobby to terminate the game (e.g., player was kicked)
  onGameTerminated() {
    this.game_over = true;
  }

  keyDownHandler(e) {
    this.input_changed = true;
    if (e.keyCode == 87)  // "e"
    {
      this.up_pressed = true;
    }
    else if (e.keyCode == 83) // "d"
    {
      this.down_pressed = true;
    }
    else if (e.keyCode == 68) { // "d"
      this.right_pressed = true;
    }
    else if (e.keyCode == 65) { // "a"
      this.left_pressed = true;
    }
    else if (e.keyCode == 32) { // "space"
      this.space_pressed = true;
    }
  }

  keyUpHandler(e) {
    this.input_changed = true;
    if (e.keyCode == 87)  // "e"
    {
      this.up_pressed = false;
    }
    else if (e.keyCode == 83) // "d"
    {
      this.down_pressed = false;
    }
    else if(e.keyCode == 68) {
      this.right_pressed = false;
    }
    else if(e.keyCode == 65) {
      this.left_pressed = false;
    }
    else if (e.keyCode == 32) { // "space"
      this.space_pressed = false;
    }
  }
}
