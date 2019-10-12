// Node imports
if (typeof window === 'undefined') {
  Spaceship = require('./../shared/spaceship.js').Spaceship;
  Transform = require('./../shared/transform.js').Transform;
}

/*
Server-side spaceship class. Wraps the Spaceship component.
*/
class ServerSpaceship {
  constructor(player_id, x, y, r_heading) {
    this.player_id = player_id;
    this.transform = new Transform(x, y, r_heading);
    this.spaceship = new Spaceship(this.transform);
  }

  update(ms) {
    this.spaceship.update(ms);
  }

  setInput(up, down, left, right, space) {
    this.spaceship.setInput(up, down, left, right, space);
  }

  collides(collider) {
    return this.spaceship.collides(collider);
  }

  onCollision(sprite) {
    this.spaceship.onCollision(sprite);
  }

  serialize() {
    return this.spaceship.serialize();
  }
}

if (typeof window === 'undefined') {
  module.exports.ServerSpaceship = ServerSpaceship;
}
