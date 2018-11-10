/*
Base sprite class. Can be instantiated directly.
*/
class Sprite {
  constructor(img, x, y) {
    this.x = x;
    this.y = y;
    this.img_width = img.width;
    this.img_height = img.height;
    this.speed = 0;  // speed in forward direction
    this.accel = 0;  // acceleration in forward direction
    this.max_speed = 10;
    this.dx = 0;
    this.dy = 0;
    this.ax = 0;
    this.ay = 0;
    this.img = img;
    this.radRotation = 0.0;  // degrees rotation clockwise, from top
    this.hp = 100;
  }

  handleControls(up_pressed, down_pressed, left_pressed, right_pressed, space_pressed) {
    if (up_pressed)
    {
      this.accel = 2;
    }
    else if (!up_pressed)
    {
      // decellerate if up is not pressed
      this.accel = -1.0;
    }
    if (down_pressed)
    {
      this.accel = -2;
    }
    if (right_pressed)
    {
      this.radRotation += 0.09;
    }
    if (left_pressed)
    {
      this.radRotation -= 0.09;
    }
  }

  update(ms) {
    this.speed += this.accel;

    if (this.speed > this.max_speed) {
      this.speed = this.max_speed;
    }
    else if (this.speed < 0) {
      this.speed = 0;
    }

    // move by speed pixels in direction specified by radRotation
    this.dx = this.speed * Math.cos(this.radRotation);
    this.dy = this.speed * Math.sin(this.radRotation);
  }

  move(ms) {
    this.x += this.dx;
    this.y += this.dy;
  }

  // draws sprite to the context, given the coordinates where the viewing starts
  // (i.e., coordinates where the top-left of the screen starts)
  draw(context, view_x, view_y) {
    console.log("Drawing sprite with offsets " + view_x + ", " + view_y);
    if (this.radRotation == 0) {
      context.drawImage(this.img, this.x - view_x, this.y - view_y);
    }
    else {
      var center_x = this.x + this.img_width / 2 - view_x;
      var center_y = this.y + this.img_height / 2 - view_y;

      context.translate(center_x, center_y);
      context.rotate(this.radRotation);
      context.drawImage(this.img, -this.img_width / 2, -this.img_height / 2, this.img_width, this.img_height);
      context.rotate(-this.radRotation);
      context.translate(-center_x, -center_y);
    }
  }
}
