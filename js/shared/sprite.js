// Node imports
if (typeof window === 'undefined') {
  Rect = require('./rect.js').Rect;
  TextureAtlas = require('./texture_atlas.js').TextureAtlas;
  TextureId = require('./texture_atlas.js').TextureId;
}

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
  { IMG_ID: TextureId.SPACESHIP_IMG, HP: 100, MAX_SPEED: 0.3, DAMAGE: 30 },
  { IMG_ID: TextureId.POWER_UP, HP: 0, MAX_SPEED: 0.3, DAMAGE: 0 },
  { IMG_ID: TextureId.AMMO_DROP, HP: 0, MAX_SPEED: 0.3, DAMAGE: 0 },
  { IMG_ID: TextureId.BULLET_IMG, HP: 0, MAX_SPEED: 0.5, DAMAGE: 10 }
];


/*
Base sprite class. Can be instantiated directly, but generally meant to be subclassed.
*/
class Sprite {
  constructor(id, sprite_type, x, y, texture_atlas) {
    this.id = id;
    this.sprite_type = sprite_type;  // TODO: CHECK IT'S A VALID VALUE?
    this.x = x;
    this.y = y;

    var attributes = SPRITE_ATTRS[sprite_type];
    this.img_id = attributes.IMG_ID;
    this.img_width = texture_atlas.getWidth(this.img_id);
    this.img_height = texture_atlas.getHeight(this.img_id);
    this.hitbox = new Rect(this.x, this.y, this.img_width, this.img_height);
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
    this.particles = [];  // particles created by the sprite
    this.random_seed = 10;
  }

  update(ms) {
    this.speed += this.accel ; //* ms;

    // normalize speed to [0, max_speed]
    if (this.speed > this.max_speed) {
      this.speed = this.max_speed;
    }
    else if (this.speed < 0) {
      this.speed = 0;
    }

    // update any particles being tracked
    for (var i = 0; i < this.particles.length; ) {
      var particle_obj = this.particles[i];
      particle_obj.update(ms);

      // remove if destroy = true
      if (particle_obj.destroy) {
        this.particles.splice(i, 1);
      }
      else {
        i++;
      }
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

  // draws sprite to the context, given the coordinates where the viewing starts
  // (i.e., coordinates where the top-left of the screen starts)
  draw(context, texture_atlas, view_x, view_y) {
    texture_atlas.drawImg(context, this.x - view_x, this.y - view_y,
      this.img_id, this.r_img_rotation);

    // draw particles
    for (var i = 0; i < this.particles.length; i++) {
      this.particles[i].draw(context, texture_atlas, view_x, view_y);
    }

    context.beginPath();
    context.lineWidth = "2";
    context.strokeStyle = "#FF0000";
    context.rect(this.hitbox.x - view_x, this.hitbox.y - view_y, this.hitbox.w, this.hitbox.h);
    context.stroke();
  }

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
      max_speed: this.max_speed,
      r_heading: this.r_heading,
      r_img_rotation: this.r_img_rotation,
      collides: this.collides,
      hp: this.hp,
      full_hp: this.full_hp,
      damage: this.damage,
      dead: this.dead,
      destroy: this.destroy
    };
  }

  // sets the parameters based on the serialized data
  deserialize(serialized_obj) {
    this.id = serialized_obj.id;
    this.sprite_type = serialized_obj.sprite_type;
    this.x = serialized_obj.x;
    this.y = serialized_obj.y;
    this.hitbox.x = this.x;
    this.hitbox.y = this.y;
    this.speed = serialized_obj.speed;
    this.accel = serialized_obj.accel;
    this.max_speed = serialized_obj.max_speed;
    this.r_heading = serialized_obj.r_heading;
    this.r_img_rotation = serialized_obj.r_img_rotation;
    this.collides = serialized_obj.collides;
    this.hp = serialized_obj.hp;
    this.full_hp = serialized_obj.full_hp;
    this.damage = serialized_obj.damage;
    this.dead = serialized_obj.dead;
    this.destroy = serialized_obj.destroy;
  }

  // given the serialized version, eases this object to the data given
  easeTo(auth_state) {
    // calculate difference in position from authoritative
    var dx = auth_state.x - this.x;
    var dy = auth_state.y - this.y;

    // snap to position if greater than 30 pixels off
    if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
      this.x = auth_state.x;
      this.y = auth_state.y;
    }
    // ease toward the given position
    else {
      this.x += dx / 10;
      this.y += dy / 10;
    }

    // adjust hitbox
    this.hitbox.x = this.x;
    this.hitbox.y = this.y;

    // calculate difference in heading from authoritative
    var diff_heading = auth_state.r_heading - this.r_heading;

    // snap to heading if greater than 0.35rad off
    if (Math.abs(diff_heading) > 0.35) {
      this.r_heading = auth_state.r_heading;
    }
    // ease toward given heading
    else {
      this.r_heading += diff_heading / 5;
    }

    // calculate difference in rotation from authoritative
    var diff_rotation = auth_state.r_img_rotation - this.r_img_rotation;

    // snap to heading if greater than 0.35rad off
    if (Math.abs(diff_rotation) > 0.35) {
      this.r_img_rotation = auth_state.r_img_rotation;
    }
    // ease toward given heading
    else {
      this.r_img_rotation += diff_rotation / 5;
    }

    // snap speed, accel, and other values
    this.speed = auth_state.speed;
    this.accel = auth_state.accel;
    this.max_speed = auth_state.max_speed;
    this.collides = auth_state.collides;
    this.hp = auth_state.hp;
    this.full_hp = auth_state.full_hp;
    this.damage = auth_state.damage;
    this.dead = auth_state.dead;
    this.destroy = auth_state.destroy;
  }
}

if (typeof window === 'undefined') {
  module.exports.Sprite = Sprite;
  module.exports.SpriteType = SpriteType;
}
