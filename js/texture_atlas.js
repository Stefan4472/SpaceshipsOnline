/*
Allows drawing an image based on the constant id given.
*/
class TextureAtlas {
  // TODO: LOAD IMAGES FROM THE WEB
  constructor(spaceship, spaceship_hit, bullet, background_img) {
    this.images = [null, spaceship, spaceship_hit, bullet, background_img];

    // assign indexes to ids
    this.NULL_IMG = 0;
    this.SPACESHIP_IMG = 1;
    this.SPACESHIP_HIT_IMG = 2;
    this.BULLET_IMG = 3;
    this.BACKGROUND_IMG = 4;
    this.NUM_IMAGES = 5;
  }

  // draw the image specified by img_id to context at (x, y)
  // specify rotation (radians clockwise) with the rad_rotation arg
  drawImg(context, x, y, img_id, rad_rotation=0) {
    if (img_id <= this.NULL_IMG || img_id > this.NUM_IMAGES) {
      console.log("INVALID IMAGE ID");
      return;
    }

    if (rad_rotation) {
      var img = this.images[img_id];
      var center_x = x + img.width / 2;
      var center_y = y + img.height / 2;

      context.translate(center_x, center_y);
      context.rotate(rad_rotation);
      context.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
      context.rotate(-rad_rotation);
      context.translate(-center_x, -center_y);
    }
    else {
      context.drawImage(this.images[img_id], x, y);
    }
  }
}
