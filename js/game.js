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

    this.initialized = false;
    this.texture_atlas_ready = false;
    this.background_ready = false;
    this.started = false;
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

    // the player's Spaceship sprite (set in initGameState)
    this.player = null;
    this.player_id = -1;
    this.players = [];  // TODO: MAKE A DICTIONARY (?)

    // bullets fired by players and being tracked
    this.bullets = [];

    // power-ups floating around the map
    this.power_ups = [];

    // shows player's healthbar. Initialized in start()
    this.healthbar_view = null;
    // this.random_seed
  }

  // starts the game
  start() {
    // TODO: WAIT FOR RESOURCES TO LOAD?
    console.log("Starting game. Sending new player request");
    Client.askNewPlayer();
  }

  // initialize game state with information from the server
  // includes xml defining the various players, as well as the id of this player
  initGameState(players, my_id) {
    console.log("Initializing Game State");
    this.player_id = my_id;

    // create and add player sprites
    for (var i = 0; i < players.length; i++) {
      this.addPlayer(players[i].id, players[i].x, players[i].y);
    }

    // set this player
    for (var i = 0; i < this.players.length; i++) {
      if (this.players[i].id == this.player_id) {
        this.player = this.players[i];

        console.log("Setting this.player to player at " + i + " with id " + my_id);
        console.log("has x, y " + this.player.x + ", " + this.player.y);

        // init healthbar display
        this.healthbar_view = new GuiHealthbar(this.player,
          this.screen_width, this.screen_height);

        break;
      }
    }

    // add some power-ups (TODO: THIS IS JUST FOR TESTING)
    this.power_ups.push(new Powerup(0, 100, 100, this.texture_atlas));
    this.power_ups.push(new Powerup(1, 400, 700, this.texture_atlas));
    this.power_ups.push(new Powerup(2, 600, 300, this.texture_atlas));

    this.initialized = true;
    console.log("Done. Starting game...");
    // save Game execution state
    var _this = this;

    // add key listeners
    document.addEventListener("keydown", function(e) { _this.keyDownHandler(e); }, false);
    document.addEventListener("keyup", function(e) { _this.keyUpHandler(e); }, false);

    // set updateAndDraw() on interval
    window.requestAnimationFrame(function(){ _this.updateAndDraw(); });  // TODO: NEED A BETTER FUNCTION/TIMER
  }

  updateAndDraw() {
    var curr_time = Date.now();
    console.log("Updating at time " + curr_time)

    if (!this.started) {
      this.started = true;
      this.last_update_time = curr_time;
    }

    var ms_since_update = curr_time - this.last_update_time;
    console.log("Updating by " + ms_since_update + "ms");

    // handle controls pressed by player
    this.player.handleControls(ms_since_update, this.up_pressed,
      this.down_pressed, this.left_pressed, this.right_pressed,
      this.space_pressed);

    // send controls to server
    if (this.input_changed) {
      Client.sendControls(this.up_pressed, this.down_pressed,
        this.left_pressed, this.right_pressed, this.space_pressed);
      this.input_changed = false;
    }

    // collision detection
    for (var i = 0; i < this.players.length; i++) {
      // check players
      for (var j = i + 1; j < this.players.length - 1; j++) {
        if (this.players[i].collides && this.players[j].collides &&
            this.players[i].hitbox.intersects(this.players[j].hitbox)) {
          this.players[i].onCollision(this.players[j]);
          this.players[j].onCollision(this.players[i]);
        }
      }

      // check bullets
      for (var j = 0; j < this.bullets.length; j++) {
        if (this.players[i].collides && this.bullets[j].collides &&
            this.players[i].id != this.bullets[j].shooter_id &&
            this.players[i].hitbox.intersects(this.bullets[j].hitbox)) {
          this.players[i].onCollision(this.bullets[j]);
          this.bullets[j].onCollision(this.players[i]);
        }
      }

      // check power-ups
      for (var j = 0; j < this.power_ups.length; j++) {
        if (this.players[i].collides && this.power_ups[j].collides &&
            this.players[i].hitbox.intersects(this.power_ups[j].hitbox)) {
          this.players[i].onCollision(this.power_ups[j]);
          this.power_ups[j].onCollision(this.players[i]);
        }
      }
    }

    // update each sprite client-side
    for (var i = 0; i < this.players.length; i++) {
      var player_obj = this.players[i];

      if (player_obj.destroy) {
        console.log("Destroying player");
        this.players.splice(i, 1);
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

    this.background.center_to(
      this.player.x + this.player.img_width / 2,
      this.player.y + this.player.img_height / 2);

    this.healthbar_view.update(ms_since_update);

    this.drawGame()

    this.last_update_time = curr_time;
    var _this = this;
    window.requestAnimationFrame(function(){ _this.updateAndDraw(); });
  }

  drawGame() {
    this.background.draw(this.ctx, this.texture_atlas);

    for (var i = 0; i < this.bullets.length; i++) {
      this.bullets[i].draw(this.ctx, this.texture_atlas,
        this.background.view_x, this.background.view_y);
    }

    for (var i = 0; i < this.power_ups.length; i++) {
      this.power_ups[i].draw(this.ctx, this.texture_atlas,
        this.background.view_x, this.background.view_y);
    }

    for (var i = 0; i < this.players.length; i++) {
      this.players[i].draw(this.ctx, this.texture_atlas,
        this.background.view_x, this.background.view_y);
    }

    this.healthbar_view.draw(this.ctx, this.texture_atlas);
  }

  addPlayer(id, x, y) {
    console.log("Game adding player with id " + id + " at " + x + ", " + y);
    // TODO: FIX THIS
    this.players.push(
      new Spaceship(id, x, y, this.texture_atlas));
  }

  removePlayer(id) {
    console.log("Game removing player " + id);
    for (var i = 0; i < this.players.length; i++) {
      if (this.players[i].id == id) {
        this.players[i].destroy = true;
      }
    }
  }

  // send controls to a player
  inputControls(id, up, down, left, right, space) {
    console.log("Game inputting controls for player " + id);
    for (var i = 0; i < this.players.length; i++) {
      if (this.players[i].id == id) {
        this.players[i].handleControls(up, down, left, right, space);
      }
    }
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
