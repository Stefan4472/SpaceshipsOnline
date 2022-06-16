/*
Plays a spritesheet by cycling through the frames over time.
*/
class SpritesheetPlayer {
  constructor() {
    // spritesheet being played
    this.spritesheet = null;
    this.frame_index = 0;
    this.ms_left_this_frame = 0;
    // whether the currently-set animation has played at least once
    this.has_played = false;
    this.finished = true;
    this.visible = false;
  }

  setSpritesheet(spritesheet) {
    console.log("Spritesheet player receiving spritesheet with " + spritesheet.num_frames);
    this.spritesheet = spritesheet;
    this.frame_index = 0;
    this.has_played = false;
    this.ms_left_this_frame = spritesheet.ms_per_frame;
    this.visible = true;  // TODO: THIS VARIABLE DOESN'T MAKE A WHOLE LOT OF SENSE
    this.finished = false;
  }

  // update animation by the given number of milliseconds
  update(ms) {  // TODO: CHECK THERE'S A SPRITESHEET TO PLAY FIRST?
    if (this.spritesheet == null) {
      return;
    }

    while (ms >= this.ms_left_this_frame) {
      ms -= this.ms_left_this_frame;
      this.ms_left_this_frame = this.spritesheet.ms_per_frame;
      this.frame_index++;

      // went past the last friend
      if (this.frame_index == this.spritesheet.num_frames) {
        this.has_played = true;
        this.finished = !this.spritesheet.loops;
        // handle loops (send back to frame zero)
        this.frame_index = this.spritesheet.loops ? 0 : this.frame_index;
      }
    }
    this.ms_left_this_frame -= ms;
  }

  // draw current frame of the animation to context at (x, y)
  // using the given TextureAtlas.
  draw(context, texture_atlas, x, y) {
    if (this.visible && !this.finished) {
      console.log("Drawing spritesheet");
      texture_atlas.drawSubimg(context, this.spritesheet.img_id,
        this.frame_index * this.spritesheet.frame_width, 0,
        this.spritesheet.frame_width, this.spritesheet.frame_height,
        x, y, this.spritesheet.frame_width, this.spritesheet.frame_height);
    }
  }
}