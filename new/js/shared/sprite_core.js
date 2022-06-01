// Node imports
if (typeof window === 'undefined') {
  Rect = require('./rect.js').Rect;
}


// "Enum" for sprites that can be initialized.
var SpriteType = {};
SpriteType.SPACESHIP = 1;
// SpriteType.POWER_UP = 2;
// SpriteType.AMMO_DROP = 3;
// SpriteType.BULLET = 4;

// Some default settings for each SpriteType.
var SPRITE_ATTRS = [
  {},
  { HP: 100, MAX_SPEED: 0.3, DAMAGE: 30 },
  // { HP: 0, MAX_SPEED: 0.3, DAMAGE: 0 },
  // { HP: 0, MAX_SPEED: 0.3, DAMAGE: 0 },
  // { HP: 0, MAX_SPEED: 0.5, DAMAGE: 10 }
];


/*
Core logic for the base sprite class.
*/
class SpriteCore {
  constructor(id, sprite_type, x, y, r_heading) {
    this.id = id;
    this.sprite_type = sprite_type;  // TODO: CHECK IT'S A VALID VALUE?
    this.x = x;
    this.y = y;
    this.r_heading = r_heading;

    var attributes = SPRITE_ATTRS[sprite_type];
    // this.hitbox = new Rect(this.x, this.y, this.img_width, this.img_height);
    // Speed in forward direction (per ms)
    this.speed = 0;
    // Acceleration in forward direction (per ms)
    this.accel = 0;
    // Maximum speed the sprite can reach
    this.max_speed = attributes.MAX_SPEED;
    // Radians rotation clockwise OF SPIRTE--direction heading in
    this.r_heading = 0.0;
    // this.collides = true;  // whether this sprite can collide with other sprites
    // this.hp = attributes.HP;  // health (i.e., damage this sprite can take before being destroyed)
    // this.full_hp = attributes.HP;  // maximum health
    // this.damage = attributes.DAMAGE;  // damage this does to any sprite it hits
    // this.dead = false;  // if the sprite's hp has reached or gone below zero
    // this.destroy = false;  // set to true to be removed by game engine
    // this.particles = [];  // particles created by the sprite
    // this.random_seed = 10;
  }

  update(ms) {
    this.speed += this.accel;

    // normalize speed to [0, max_speed]
    if (this.speed > this.max_speed) {
      this.speed = this.max_speed;
    }
    else if (this.speed < 0) {
      this.speed = 0;
    }
  }

  move(ms) {
    var dx = this.speed * ms * Math.cos(this.r_heading);
    var dy = this.speed * ms * Math.sin(this.r_heading);

    // move by speed pixels in direction specified by r_heading
    this.x += dx;
    this.y += dy;

    // this.hitbox.x += dx;
    // this.hitbox.y += dy;
  }

  // // called when this sprite collides with another sprite
  // onCollision(sprite) {
  //   console.log("Collision detected!!");
  //   this.hp -= sprite.damage;
  //
  //   if (this.hp <= 0) {
  //     this.hp = 0;
  //     this.onDeath();
  //   }
  // }

  // onDeath() {
  //   this.dead = true;
  //   this.destroy = true;
  // }

  // TODO: BETTER DESCRIPTIONS, BETTER SERIALIZATION
  // serializes to a JSON object--note: currently, serialization just saves
  // the fields that are crucial
  serialize() {
    return {
      id: this.id,
      sprite_type: this.sprite_type,
      x: this.x,
      y: this.y,
      speed: this.speed,
      accel: this.accel,
      r_heading: this.r_headingn,
      // collides: this.collides,
      // hp: this.hp,
      // full_hp: this.full_hp,
      // damage: this.damage,
      // dead: this.dead,
      // destroy: this.destroy
    };
  }

  // sets the parameters based on the serialized data
  deserialize(serialized) {
    this.id = serialized.id;
    this.sprite_type = serialized.sprite_type;
    this.x = serialized.x;
    this.y = serialized.y;
    // this.hitbox.x = this.x;
    // this.hitbox.y = this.y;
    this.speed = serialized.speed;
    this.accel = serialized.accel;
    this.r_heading = serialized.r_heading;
    // this.collides = serialized.collides;
    // this.hp = serialized.hp;
    // this.full_hp = serialized.full_hp;
    // this.damage = serialized.damage;
    // this.dead = serialized.dead;
    // this.destroy = serialized.destroy;
  }
}

// Node exports
if (typeof window === 'undefined') {
  module.exports.SpriteCore = SpriteCore;
  module.exports.SpriteType = SpriteType;
}
