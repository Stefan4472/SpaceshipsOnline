/*
Base sprite class. Can be instantiated directly, but generally meant to be subclassed.
*/
class Sprite {
  constructor(id, x, y, img_id, img_width, img_height, hp) {  // TODO: MAX_SPEED, ROTATION_SPEED
    this.id = id;
    this.x = x;
    this.y = y;
    this.img_id = img_id;
    this.img_width = img_width;
    this.img_height = img_height;
    this.hitbox = new Rect(this.x, this.y, this.img_width, this.img_height);
    this.speed = 0;  // speed in forward direction
    this.accel = 0;  // acceleration in forward direction
    this.max_speed = 10;
    this.radRotation = 0.0;  // degrees rotation clockwise, from top
    this.hp = hp;
    this.damage = 0;  // damage this does to any sprite it hits
    this.full_hp = hp;
    this.destroy = false;  // set to true to be removed by game engine
    this.particles = [];  // particles created by the sprite
    this.random_seed = 10;
  }

  update(ms) {
    this.speed += this.accel;

    if (this.speed > this.max_speed) {
      this.speed = this.max_speed;
    }
    else if (this.speed < 0) {
      this.speed = 0;
    }

    // update any particles being tracked
    for (var i = 0; i < this.particles.length; ) {
      var particle_obj = this.particles[i];
      particle_obj.update(ms);

      // remove if destroy = true
      if (particle_obj.destroy) {
        this.particles.splice(i, 1);
      }
      else {
        i++;
      }
    }
  }

  move(ms) {
    var dx = this.speed * Math.cos(this.radRotation);
    var dy = this.speed * Math.sin(this.radRotation);

    // move by speed pixels in direction specified by radRotation
    this.x += dx;
    this.y += dy;

    this.hitbox.x += dx;
    this.hitbox.y += dy;
  }

  // called when this sprite collides with another sprite
  onCollision(sprite) {
    console.log("Collision detected!!");
    this.hp -= sprite.damage;

    if (this.hp <= 0) {
      this.hp = 0;
      onDeath();
    }
  }

  onDeath() {
    this.destroy = true;
  }

  // draws sprite to the context, given the coordinates where the viewing starts
  // (i.e., coordinates where the top-left of the screen starts)
  draw(context, texture_atlas, view_x, view_y) {
    texture_atlas.drawImg(context, this.x - view_x, this.y - view_y,
      this.img_id, this.radRotation);

    // draw particles
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].draw(context, texture_atlas, view_x, view_y);
    }

    context.beginPath();
    context.lineWidth = "2";
    context.strokeStyle = "#FF0000";
    context.rect(this.hitbox.x - view_x, this.hitbox.y - view_y, this.hitbox.w, this.hitbox.h);
    context.stroke();
  }
}
