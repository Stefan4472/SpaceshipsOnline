/*
Class for a bullet, fired by a spaceship.
*/
class Bullet extends Sprite {  // TODO: SMOKE PARTICLES
  constructor(id, shooter_id, bullet_num, x, y, radRotation,
      img_width, img_height) {
    super(id, x, y, TextureId.BULLET_IMG, img_width, img_height, 10);
    this.radRotation = radRotation;
    this.speed = 10;
    // record starting coordinates
    this.start_x = x;
    this.start_y = y;
    // max distance squared (px) this bullet can travel
    this.max_dist_sqr = 10000;
  }

  // calls sprite update() method and sets destroy=true if bullet has
  // travelled too far
  update(ms) {
    Sprite.prototype.update.call(this, ms);

    // set to destroy if it's gone too far
    this.destroy = (this.x - this.start_x) * (this.x - this.start_x) +
      (this.y - this.start_y) * (this.y - this.start_y) >= this.max_dist_sqr;
  }
}
