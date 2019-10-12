// Node imports
if (typeof window === 'undefined') {
  Rect = require('./rect.js').Rect;
}

class Collider {
  constructor(transform, offset_x, offset_y, wx, wy, callback_fcn) {
    this.transform = transform;
    this.offset_x = offset_x;
    this.offset_y = offset_y;
    this.hitbox = new Rect(transform.x + offset_x,
                           transform.y + offset_y,
                           wx, wy, transform.rad_rotation);
    this.callback_fcn = callback_fcn;
  }

  // Updates Collider position based on the parent transform.
  update(ms) {
    this.hitbox.x = this.transform.x + this.offset_x;
    this.hitbox.y = this.transform.y + this.offset_y;
  }

  // Return whether this collider is colliding with the given
  // Collider. Uses their hitboxes to perform the check.
  collides(collider) {  // TODO: CALL THE CALLBACK_FCN?
    return this.hitbox.intersects(collider.hitbox);
  }
}

if (typeof window === 'undefined') {
  module.exports.Collider = Collider;
}
