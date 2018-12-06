/*
"Enum" for sprites that can be initialized.
*/
var SpriteType = {};
SpriteType.SPACESHIP = 1;
SpriteType.POWER_UP = 2;
SpriteType.AMMO_DROP = 3;
SpriteType.BULLET = 4;

/*
Attributes stored by SpriteType.
*/
var SPRITE_ATTRS = [
  {},
  { WIDTH: 41, HEIGHT: 34, HP: 100, MAX_SPEED: 0.3, DAMAGE: 30 },
  { WIDTH: 6, HEIGHT: 6, HP: 0, MAX_SPEED: 0.3, DAMAGE: 0 },
  { WIDTH: 6, HEIGHT: 6, HP: 0, MAX_SPEED: 0.3, DAMAGE: 0 },
  { WIDTH: 9, HEIGHT: 3, HP: 0, MAX_SPEED: 0.5, DAMAGE: 10 }
];

// import the Rect class
var Rect = require('./rect.js').Rect;

/*
Base sprite class. Can be instantiated directly, but generally meant to be
subclassed. Derives most attributes based on SpriteType value.
*/
class Sprite {
  constructor(id, sprite_type, x, y) {
    this.id = id;
    this.sprite_type = sprite_type;  // TODO: CHECK IT'S A VALID VALUE?
    this.x = x;
    this.y = y;

    var attributes = SPRITE_ATTRS[sprite_type];
    this.hitbox = new Rect(this.x, this.y, attributes.WIDTH, attributes.HEIGHT);
    this.speed = 0;  // speed in forward direction (per ms)
    this.accel = 0;  // acceleration in forward direction (per ms)
    this.max_speed = attributes.MAX_SPEED;  // maximum speed the sprite can reach
    this.r_heading = 0.0;  // radians rotation clockwise OF SPIRTE--direction heading in
    this.r_img_rotation = 0.0;  // radians rotation clockwise OF IMAGE
    this.collides = true;  // whether this sprite can collide with other sprites
    this.hp = attributes.HP;  // health (i.e., damage this sprite can take before being destroyed)
    this.full_hp = attributes.HP;  // maximum health
    this.damage = attributes.DAMAGE;  // damage this does to any sprite it hits
    this.dead = false;  // if the sprite's hp has reached or gone below zero
    this.destroy = false;  // set to true to be removed by game engine
    this.random_seed = 10;
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

    this.hitbox.x += dx;
    this.hitbox.y += dy;
  }

  // called when this sprite collides with another sprite
  onCollision(sprite) {
    console.log("Collision detected!!");
    this.hp -= sprite.damage;

    if (this.hp <= 0) {
      this.hp = 0;
      this.onDeath();
    }
  }

  onDeath() {
    this.dead = true;
    this.destroy = true;
  }
}

module.exports.Sprite = Sprite;
module.exports.SpriteType = SpriteType;
