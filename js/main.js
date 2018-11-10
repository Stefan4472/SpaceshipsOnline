/*
Main Client code, which creates and starts the main Game instance.
*/
var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
var up_pressed = false;
var down_pressed = false;
var left_pressed = false;
var right_pressed = false;
var space_pressed = false;
var random_seed = 10;

var spaceship_img = document.getElementById("spaceships_img");
var background_img = document.getElementById("background_img");

var spaceship_sprite = new Spaceship(1, spaceship_img, 25, 25);
var map = new Background(background_img, 1000, 1000, canvas.width, canvas.height);

function draw() {
  spaceship_sprite.handleControls(up_pressed, down_pressed, left_pressed, right_pressed, space_pressed);
  spaceship_sprite.update(20);
  spaceship_sprite.move(20);

  map.center_to(spaceship_sprite.x + spaceship_sprite.img_width / 2,
    spaceship_sprite.y + spaceship_sprite.img_height / 2);

  map.draw(ctx);
  spaceship_sprite.draw(ctx, map.view_x, map.view_y);
}

function keyDownHandler(e) {
  if (e.keyCode == 87)  // "e"
  {
    up_pressed = true;
  }
  else if (e.keyCode == 83) // "d"
  {
    down_pressed = true;
  }
  else if (e.keyCode == 68) { // "d"
    right_pressed = true;
  }
  else if (e.keyCode == 65) { // "a"
    left_pressed = true;
  }
  else if (e.keyCode == 32) { // "space"
    space_pressed = true;
  }
}

function keyUpHandler(e) {
  if (e.keyCode == 87)  // "e"
  {
    up_pressed = false;
  }
  else if (e.keyCode == 83) // "d"
  {
    down_pressed = false;
  }
  else if(e.keyCode == 68) {
    right_pressed = false;
  }
  else if(e.keyCode == 65) {
    left_pressed = false;
  }
  else if (e.keyCode == 32) { // "space"
    space_pressed = false;
  }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
setInterval(draw, 100);
