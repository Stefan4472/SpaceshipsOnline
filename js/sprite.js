/*
Base sprite class. Can be instantiated directly, but generally meant to be subclassed.
*/
class Sprite {
  constructor(id, img, x, y, hp) {  // TODO: MAX_SPEED, ROTATION_SPEED
    this.id = id;
    this.img = img;
    this.img_width = img.width;
    this.img_height = img.height;
    this.x = x;
    this.y = y;
    this.speed = 0;  // speed in forward direction
    this.accel = 0;  // acceleration in forward direction
    this.max_speed = 10;
    this.radRotation = 0.0;  // degrees rotation clockwise, from top
    this.hp = hp;
  }

  update(ms) {
    this.speed += this.accel;

    if (this.speed > this.max_speed) {
      this.speed = this.max_speed;
    }
    else if (this.speed < 0) {
      this.speed = 0;
    }
  }

  move(ms) {
    // move by speed pixels in direction specified by radRotation
    this.x += this.speed * Math.cos(this.radRotation);
    this.y += this.speed * Math.sin(this.radRotation);
  }

  // draws sprite to the context, given the coordinates where the viewing starts
  // (i.e., coordinates where the top-left of the screen starts)
  draw(context, view_x, view_y) {
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

    // TODO: draw healthbar above
  }
}
