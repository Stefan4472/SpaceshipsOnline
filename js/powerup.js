/*
A power-up is a sprite on the map that can be picked up by a Spaceship.
The power-up is applied to a sprite using the apply(sprite) method.
*/
class Powerup extends Sprite {
  constructor(id, x, y, texture_atlas) {
    super(id, SpriteType.POWER_UP, x, y, texture_atlas);

    // set random heading
    this.r_heading = Math.random();
    // amount to rotate per millisecond (radians) TODO: RANDOMIZE
    this.rotation_speed = 0.02;
    this.speed = 0.1;
    this.hp_value = 50;
  }

  update(ms) {
    Sprite.prototype.update.call(this, ms);

    this.r_img_rotation += ms * this.rotation_speed;
  }

  onCollision(sprite) {
    // apply power-up to sprite
    this.apply(sprite);

    this.onDeath();
  }

  apply(sprite) {
    if (sprite.hp + this.hp_value > sprite.full_hp) {
      sprite.full_hp = sprite.hp + this.hp_value;
    }
    sprite.hp += this.hp_value;
    this.destroy = true;
  }
}
