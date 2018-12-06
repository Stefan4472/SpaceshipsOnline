// Node imports
if (typeof window === 'undefined') {
  Drop = require('./drop.js').Drop;
}

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
    this.num_bullets = 20;
    this.ms_draw_consume_anim = 0;
  }

  update(ms) {
    Drop.prototype.update.call(this, ms);

    console.log("ms draw consume is " + this.ms_draw_consume_anim);
    if (this.consumed && this.ms_draw_consume_anim > ms) {
      this.ms_draw_consume_anim -= ms;
    }
    else if (this.consumed) {
      this.ms_draw_consume_anim = 0;
      this.onDeath();
    }
  }

  apply(sprite) {
    // give the sprite more ammunition
    sprite.ammo_left += this.num_bullets;
    // start consume animation
    this.ms_draw_consume_anim = 2000;
  }

  onDeath() {
    this.destroy = true;
  }

  draw(context, texture_atlas, view_x, view_y) {
    Drop.prototype.draw.call(this, context, texture_atlas, view_x, view_y);

    // draw amount of ammo give at (x, y) of collision
    if (this.consumed && this.ms_draw_consume_anim > 0) {
      console.log("drawing consumed animation");
      context.fillStyle = '#FFFFFF';
      context.font = "30px Arial";
      context.fillText(this.num_bullets.toString(), this.x, this.y);
      context.fillText(this.num_bullets.toString(), 0, 200);
    }
  }
}

// Node export
if (typeof window === 'undefined') {
  module.exports.AmmoDrop = AmmoDrop;
}
