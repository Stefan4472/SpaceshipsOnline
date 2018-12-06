/*
Class for a bullet, fired by a spaceship.
*/
class Bullet extends Sprite {  // TODO: SMOKE PARTICLES
  constructor(id, shooter_id, bullet_num, x, y, r_heading,
      platform_speed, texture_atlas) {
    super(id, SpriteType.BULLET, x, y, texture_atlas);

    this.shooter_id = shooter_id;
    this.bullet_num = bullet_num;
    this.r_heading = r_heading;
    this.r_img_rotation = r_heading;
    this.speed = platform_speed + 0.2;  // TODO: BULLET AND SPACESHIP ARE BOTH TRAVELLING AT MAX SPEED
    console.log("Creating bullet with speed " + this.speed);
    // record starting coordinates
    this.start_x = x;
    this.start_y = y;
    // max distance squared (px) this bullet can travel
    this.max_dist_sqr = 10000;
  }

  // calls sprite update() method and sets destroy=true if bullet has
  // travelled too far
  update(ms) { // TODO: PARTICLES
    Sprite.prototype.update.call(this, ms);

    // set to destroy if it's gone too far
    this.destroy = (this.x - this.start_x) * (this.x - this.start_x) +
      (this.y - this.start_y) * (this.y - this.start_y) >= this.max_dist_sqr;
  }

  // destroy bullet when collision is detected
  // TODO: PLAY ANIMATION
  onCollision(sprite) {
    this.collides = false;
    this.onDeath();
  }
}
