// Node imports
if (typeof window === 'undefined') {
  Rect = require('./rect.js').Rect;
  SpriteCore = require('./sprite_core.js').SpriteCore;
  SpriteType = require('./sprite_core.js').SpriteType;
}

// Static enum for distinguishing left and right cannons.
var CannonEnum = {};
CannonEnum.LEFT = 0;
CannonEnum.RIGHT = 1;

// Static enum for setting control of accel/decel.
// var UP_DOWN_CONTROL = {};
// UP_DOWN_CONTROL.FORWARDS = 1;
// UP_DOWN_CONTROL.BACKWARDS = -1;
// UP_DOWN_CONTROL.NONE = 0;

// Static enum for setting control of turning.
// var LEFT_RIGHT_CONTROL = {};
// LEFT_RIGHT_CONTROL.RIGHT = 1;
// LEFT_RIGHT_CONTROL.LEFT = -1;
// LEFT_RIGHT_CONTROL.NONE = 0;

/*
Core Spaceship logic (runs on both front- and back-end.
*/
class SpaceshipCore extends SpriteCore {

  constructor(player_id, x, y, r_heading) {
    // TODO: SPRITE_ID SHOULD BE DIFFERENT FROM PLAYER_ID
    super(player_id, SpriteType.SPACESHIP, x, y, r_heading);

    this.player_id = player_id;

    // TODO: INPUT CLASS
    // current input  TODO: UPDOWN, LEFTRIGHT CONTROL?
    this.up_pressed = false;
    this.down_pressed = false;
    this.left_pressed = false;
    this.right_pressed = false;
    this.space_pressed = false;
  }

  // set the spaceship's input
  // each input should be a boolean (whether currently pressed or not)
  // will be applied in the update() function as long as input is unchanged
  setInput(up, down, left, right, space) {
    this.up_pressed = up;
    this.down_pressed = down;
    this.left_pressed = left;
    this.right_pressed = right;
    this.space_pressed = space;
  }
  //
  // respawn() {
  //
  // }

  // calls sprite update() method and updates show_healthbar_ms
  update(ms) {
    SpriteCore.prototype.update.call(this, ms);

    // accelerate when up_pressed, otherwise decellerate slowly
    if (this.up_pressed) {
      this.accel = 0.1;
    }
    else {
      this.accel = -0.05;
    }
    // quickly decellerate when down_pressed
    if (this.down_pressed) {
      this.accel = -0.1;
    }
    // rotate when turning
    if (this.right_pressed) {
      this.r_heading += 0.0035 * ms;
    }
    if (this.left_pressed) {
      this.r_heading -= 0.0035 * ms;
    }
  }
}

// Node exports.
if (typeof window === 'undefined') {
  module.exports.SpaceshipCore = SpaceshipCore;
}
