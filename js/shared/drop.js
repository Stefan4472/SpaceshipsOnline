// Node imports
if (typeof window === 'undefined') {
  Sprite = require('./sprite.js').Sprite;
  SpriteType = require('./sprite.js').SpriteType;
}

/*
Parent class for "drops", objects/sprites which float around the map and are
picked up by players by collision. Once picked up, they "apply" something to
the player, e.g. health boost or extra ammunition.
*/
class Drop extends Sprite {
  constructor(id, sprite_type, x, y, texture_atlas) {
    super(id, sprite_type, x, y, texture_atlas);

    this.consumed = false;
    // amount to rotate per millisecond (radians)
    this.rotation_speed = 0;
  }

  // update like a normal sprite, then apply image rotation
  update(ms) {
    Sprite.prototype.update.call(this, ms);

    this.r_img_rotation += ms * this.rotation_speed;
  }

  // apply power-up to sprite
  // drop is consumed upon collision, so this will only be called once
  onCollision(sprite) {
    console.log("Power up collision detected with sprite_type " + sprite.sprite_type);
    if (!this.consumed && sprite.sprite_type === SpriteType.SPACESHIP) {
      console.log("POWER UP SPACESHIP COLLISION DETECTED");
      this.apply(sprite);
      this.consumed = true;
    }
  }

  // applies the drop to the given sprite (which is a Spaceship).
  // should be implemented in the sub-class
  apply(sprite) {

  }
}

// Node exports
// Node imports
if (typeof window === 'undefined') {
  module.exports.Drop = Drop;
}
