/*
Allows drawing an image based on the constant id given.
*/

// declare recognized Ids "statically" in a namespace
var TextureId = {};
TextureId.NULL_IMG = 0;
TextureId.SPACESHIP_IMG = 1;
TextureId.SPACESHIP_HIT_IMG = 2;
TextureId.BULLET_IMG = 3;
TextureId.EXHAUST_PARTICLE = 4;
TextureId.POWER_UP = 5;
TextureId.EXPLOSION_SPRITESHEET = 6;
TextureId.NUM_TEXTURES = 7;

// rectangles defining regions on the texture atlas image corresponding
// to TextureIds. (x, y, width, height)
var TEXTURE_REGIONS = [
  new Rect(0, 0, 0, 0),
  new Rect(0, 0, 40, 34),
  new Rect(41, 0, 41, 34),
  new Rect(82, 0, 9, 3),
  new Rect(82, 3, 6, 6),
  new Rect(82, 9, 14, 14),
  new Rect(0, 34, 403, 49)
];

class TextureAtlas {
  // create atlas and provide a callback function to be called when
  // the texture(s) have been loaded
  constructor() {
    var _this = this;

    // callback function (called when atlas is ready)
    // can be set from outside
    this.onready = function() { console.log("TextureAtlas onready()"); };

    // texture atlas image (containing all textures)
    this.atlas_img = new Image();
    this.atlas_img.onready = function() {
      _this.onload();  // call registered callback
    }
    this.atlas_img.src = '/assets/texture_atlas.png';
  }

  // return width (px) of specified image
  getWidth(img_id) {
    if (img_id <= this.NULL_IMG || img_id >= this.NUM_IMAGES) {
      console.log("INVALID IMAGE ID");
      return 0;
    }
    else {
      return TEXTURE_REGIONS[img_id].w;
    }
  }

  // return height (px) of specified image
  getHeight(img_id) {
    if (img_id <= this.NULL_IMG || img_id >= this.NUM_IMAGES) {
      console.log("INVALID IMAGE ID");
      return 0;
    }
    else {
      return TEXTURE_REGIONS[img_id].h;
    }
  }
  // draw the image specified by img_id to context at (x, y)
  // specify rotation (radians clockwise) with the rad_rotation arg
  drawImg(context, x, y, img_id, rad_rotation=0) {
    if (img_id <= this.NULL_IMG || img_id >= this.NUM_IMAGES) {
      console.log("INVALID IMAGE ID");
      return;
    }

    var img_params = TEXTURE_REGIONS[img_id];

    if (rad_rotation) {
      var center_x = x + img_params.w / 2;
      var center_y = y + img_params.h / 2;

      context.translate(center_x, center_y);
      context.rotate(rad_rotation);
      context.drawImage(this.atlas_img, img_params.x, img_params.y,
        img_params.w, img_params.h, -img_params.w / 2, -img_params.h / 2,
        img_params.w, img_params.h);
      context.rotate(-rad_rotation);
      context.translate(-center_x, -center_y);
    }
    else {
      context.drawImage(this.atlas_img, img_params.x, img_params.y,
        img_params.w, img_params.h, x, y, img_params.w, img_params.h);
    }
  }

  drawSubimg(context, img_id, src_x, src_y, src_w, src_h, dest_x, dest_y, dest_w, dest_h) {
    if (img_id <= this.NULL_IMG || img_id >= this.NUM_IMAGES) {
      console.log("INVALID IMAGE ID");
      return;
    }

    var img_params = TEXTURE_REGIONS[img_id];

    context.drawImage(this.atlas_img, img_params.x + src_x,
      img_params.y + src_y, src_w, src_h, dest_x, dest_y,
      dest_w, dest_h);
  }
}
