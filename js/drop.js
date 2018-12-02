/*
Parent class for "drops", objects/sprites which float around the map and are
picked up by players by collision. Once picked up, they "apply" something to
the player, e.g. health boost or extra ammunition.
*/
class Drop extends Sprite {
  constructor(id, sprite_type, x, y, texture_atlas) {
    super(id, sprite_type, x, y, texture_atlas);

    // amount to rotate per millisecond (radians)
    this.rotation_speed = 0;
  }

  // update like a normal sprite, then apply image rotation
  update(ms) {
    Sprite.prototype.update.call(this, ms);

    this.r_img_rotation += ms * this.rotation_speed;
  }

  // apply power-up to sprite and start "death" logic
  // (Drop is consumed upon collision)
  onCollision(sprite) {
    if (sprite.sprite_type == SpriteType.Spaceship) {
      this.apply(sprite);
      this.onDeath();
    }
  }

  // applies the drop to the given sprite (which is a Spaceship).
  // should be implemented in the sub-class
  apply(sprite) {

  }
}
