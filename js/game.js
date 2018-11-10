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
    this.spaceship_img = document.getElementById("spaceships_img");
    this.background_img = document.getElementById("background_img");

    this.spaceship_sprite = new Spaceship(1, this.spaceship_img, 25, 25);
    this.background = new Background(this.background_img, 1000, 1000, this.canvas.width,
      this.canvas.height);

    // this.player_id
    // this.players = []
    // this.bullets = []
    // this.random_seed

  }

  // starts the game
  start() {
    console.log(this.background.view_x);
    console.log(this.spaceship_sprite.x);
    console.log("Starting game");

    // save Game execution state
    var _this = this;

    // add key listeners
    document.addEventListener("keydown", function(e) { _this.keyDownHandler(e); }, false);
    document.addEventListener("keyup", function(e) { _this.keyUpHandler(e); }, false);

    // set update() on interval
    setInterval(function(){ _this.updateAndDraw(); }, 100);
  }

  updateAndDraw() {
    this.spaceship_sprite.handleControls(this.up_pressed, this.down_pressed,
      this.left_pressed, this.right_pressed, this.space_pressed);
    this.spaceship_sprite.update(20);
    this.spaceship_sprite.move(20);

    this.background.center_to(this.spaceship_sprite.x + this.spaceship_sprite.img_width / 2,
      this.spaceship_sprite.y + this.spaceship_sprite.img_height / 2);

    this.drawGame()
  }

  drawGame() {
    this.background.draw(this.ctx);
    this.spaceship_sprite.draw(this.ctx, this.background.view_x, this.background.view_y);
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
