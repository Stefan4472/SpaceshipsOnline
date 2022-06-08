/*
Defines a spritesheet (one row of frames) using a texture_id value,
the number of frames in the spritesheet, and the duration per frame.
*/
class Spritesheet {
  constructor(img_id, texture_atlas, num_frames, ms_per_frame, loops) {
    console.log("Creating Spritesheet with img_id " + img_id + " and " + num_frames + " frames");
    this.img_id = img_id;
    this.num_frames = num_frames;
    this.ms_per_frame = ms_per_frame;
    this.loops = loops;
    this.frame_width = texture_atlas.getWidth(img_id) / num_frames;
    this.frame_height = texture_atlas.getHeight(img_id);
  }
}