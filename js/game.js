/*
Runs the game.
*/
class Game {
  // creates the game, given the canvas to use for drawing
  constructor(canvas) {
    console.log("Game constructor");
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.up_pressed = false;
    this.down_pressed = false;
    this.left_pressed = false;
    this.right_pressed = false;
    this.space_pressed = false;

    // TODO: LOAD ASSETS AND STUFF
    this.spaceship_img = document.getElementById("spaceship_img");
    this.spaceship_hit_img = document.getElementById("spaceship_hit_img");
    this.background_img = document.getElementById("background_img");
    this.bullet_img = document.getElementById("bullet_img");

    this.texture_atlas = new TextureAtlas(this.spaceship_img, this.spaceship_hit_img,
      this.background_img, this.bullet_img);
    this.background = new Background(this.background_img, 1000, 1000, this.canvas.width,
      this.canvas.height);

    // TODO: QUERY SERVER FOR PLAYERS AND FOR CURRENT PLAYER ID
    this.player_id = -1;
    this.players = [];

    // bullets fired by players and being tracked
    this.bullets = []
    // this.random_seed
  }

  // starts the game
  start() {
    console.log("Starting game");

    this.player_id = 0;
    this.players[this.player_id] =
      new Spaceship(this.player_id, this.spaceship_img, 25, 25, this.bullet_img);

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
    this.players[this.player_id].handleControls(this.up_pressed, this.down_pressed,
      this.left_pressed, this.right_pressed, this.space_pressed);

    // update each sprite client-side
    for (var i = 0; i < this.players.length; i++) {
      var player_obj = this.players[this.player_id];

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
      this.players[this.player_id].x + this.players[this.player_id].img_width / 2,
      this.players[this.player_id].y + this.players[this.player_id].img_height / 2);

    this.drawGame()
  }

  drawGame() {
    this.background.draw(this.ctx);

    for (var i = 0; i < this.bullets.length; i++) {
      this.bullets[i].draw(this.ctx, this.background.view_x, this.background.view_y);
    }

    for (var i = 0; i < this.num_players; i++) {
      this.players[this.player_id].draw(this.ctx, this.background.view_x,
        this.background.view_y);;
    }
  }

  addPlayer(id, x, y) {
    console.log("Game adding player at " + x + ", " + y);
    this.players[id] =
      new Spaceship(id, this.spaceship_img, x, y, this.bullet_img);
  }

  removePlayer(id) {
    console.log("Game removing player " + id);
    if (id < this.players.length) {
      this.players[id].destroy = true;
    }
  }

  // send controls to a player
  inputControls(id, up, down, left, right, space) {
    console.log("Game inputting controls for player " + id);
    this.players[id].handleControls(up, down, left, right, space);
  }

  keyDownHandler(e) {
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
