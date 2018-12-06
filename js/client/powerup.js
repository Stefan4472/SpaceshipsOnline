/*
A power-up is a drop that, when picked up by a Spaceship, applies a
hp increase.
*/
class Powerup extends Drop {
  constructor(id, x, y, texture_atlas) {
    super(id, SpriteType.POWER_UP, x, y, texture_atlas);

    // set random heading
    this.r_heading = Math.random();
    this.rotation_speed = 0.02;
    this.speed = 0.1;
    this.hp_value = 50;
  }

  apply(sprite) {
    if (sprite.hp + this.hp_value > sprite.full_hp) {
      sprite.full_hp = sprite.hp + this.hp_value;
    }
    sprite.hp += this.hp_value;
    this.destroy = true;
  }

  // TODO: APPLIED ANIMATION + WRITE NUMBER OF HP INCREASED
  // onDeath() {
  
  // }
}
