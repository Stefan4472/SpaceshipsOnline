/*
A drop that, when picked up by a Spaceship, gives a certain amount of ammo.
*/
class AmmoDrop extends Drop {
  constructor(id, x, y, texture_atlas) {
    super(id, SpriteType.AMMO_DROP, x, y, texture_atlas);

    // set random heading
    this.r_heading = Math.random();
    this.rotation_speed = 0.02;
    this.speed = 0.1;
    // this.num_bullets = 30;
  }

  apply(sprite) {
    // sprite.hp += this.hp_value;
    this.destroy = true;
  }

  // TODO: APPLIED ANIMATION + WRITE NUMBER OF AMMO GIVEN
  // onDeath() {

  // }
}
