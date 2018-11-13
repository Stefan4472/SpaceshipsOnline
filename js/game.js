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

    // TODO: LOAD ASSETS AND STUFF
    this.spaceship_img = document.getElementById("spaceship_img");
    this.spaceship_hit_img = document.getElementById("spaceship_hit_img");
    this.background_img = document.getElementById("background_img");
    this.bullet_img = document.getElementById("bullet_img");

    this.texture_atlas = new TextureAtlas();
    this.background = new Background(this.texture_atlas, 1000, 1000,
      this.screen_width, this.screen_height);

    // TODO: QUERY SERVER FOR PLAYERS AND FOR CURRENT PLAYER ID
    // the player's Spaceship sprite (set in initGameState)
    this.player = null;
    this.player_id = -1;
    this.players = [];  // TODO: MAKE A DICTIONARY (?)

    // bullets fired by players and being tracked
    this.bullets = []

    // shows player's healthbar. Initialized in start()
    this.healthbar_view = null;
    // this.random_seed
  }

  // starts the game
  start() {
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

    this.initialized = true;
    console.log("Done. Starting game...");
    // save Game execution state
    var _this = this;

    // add key listeners
    document.addEventListener("keydown", function(e) { _this.keyDownHandler(e); }, false);
    document.addEventListener("keyup", function(e) { _this.keyUpHandler(e); }, false);

    // set update() on interval
    setInterval(function(){ _this.updateAndDraw(); }, 100);
  }

  updateAndDraw() {
    // handle controls pressed by player
    this.player.handleControls(this.up_pressed, this.down_pressed,
      this.left_pressed, this.right_pressed, this.space_pressed);

    // send controls to server
    if (this.input_changed) {
      Client.sendControls(this.up_pressed, this.down_pressed,
        this.left_pressed, this.right_pressed, this.space_pressed);
      this.input_changed = false;
    }

    // update each sprite client-side
    for (var i = 0; i < this.players.length; i++) {
      var player_obj = this.players[i];

      if (!player_obj.destroy) {
        player_obj.update(20);
        player_obj.move(20);

        // add player-created bullets to list
        while (player_obj.bullet_queue.length > 0) {
          this.bullets.push(player_obj.bullet_queue.shift());
        }
      }
    }

    for (var i = 0; i < this.bullets.length; ) {
      var bullet_obj = this.bullets[i];
      bullet_obj.update(20);

      // remove bullet if destroy = true
      if (bullet_obj.destroy) {
        this.bullets.splice(i, 1);
      }
      else {
        bullet_obj.move(20);
        i++;
      }
    }

    this.background.center_to(
      this.player.x + this.player.img_width / 2,
      this.player.y + this.player.img_height / 2);

    this.healthbar_view.update(20);

    this.drawGame()
  }

  drawGame() {
    this.background.draw(this.ctx, this.texture_atlas);

    for (var i = 0; i < this.bullets.length; i++) {
      this.bullets[i].draw(this.ctx, this.texture_atlas,
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
