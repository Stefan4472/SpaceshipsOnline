/*
A power-up is a sprite on the map that can be picked up by a Spaceship.
The power-up is applied to a sprite using the apply(sprite) method.
*/
class Powerup extends Sprite {
  constructor(id, x, y, img_id, img_width, img_height) {
    super(id, x, y, TextureId.POWER_UP, img_width, img_height, 0);

    // set random heading
    this.radRotation = Math.random();
    // amount to rotate per millisecond (radians)
    this.rotation_speed = 0.001;
    this.speed = 4.0;
    this.hp_value = 50;
  }

  update(ms) {
    Sprite.prototype.update.call(this, ms);

    this.radRotation += ms * this.rotation_speed;
  }

  apply(sprite) {
    if (sprite.hp + this.hp_value > sprite.full_hp) {
      sprite.full_hp = sprite.hp + this.hp_value;
    }
    sprite.hp += this.hp_value;
    this.destroy = true;
  }
}
