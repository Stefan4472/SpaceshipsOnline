/*
Allows drawing an image based on the constant id given.
*/
class TextureAtlas {
  // TODO: LOAD IMAGES FROM THE WEB
  constructor(spaceship, spaceship_hit, bullet, background_img) {
    // assign indexes to ids
    this.NULL_IMG = 0;
    this.SPACESHIP_IMG = 1;
    this.SPACESHIP_HIT_IMG = 2;
    this.BULLET_IMG = 3;
    this.BACKGROUND_IMG = 4;
    this.NUM_IMAGES = 5;

    this.images = new Array(this.NUM_IMAGES);//[null, null, null, null, null];
    this.loaded_images = 0;
    // TODO: A WAY TO TELL EVERYTHING HAS BEEN LOADED AND IS READY

    var _this = this;

    // load images from server
    var spaceship_img = new Image();
    spaceship_img.onload = function() {
      console.log("Loaded spaceship image");
      _this.images[_this.SPACESHIP_IMG] = spaceship_img;
      this.loaded_images++;
    };
    spaceship_img.src = '/assets/spaceship.png';

    var spaceship_hit_img = new Image();
    spaceship_hit_img.onload = function() {
      console.log("Loaded spaceship hit image");
      _this.images[_this.SPACESHIP_HIT_IMG] = spaceship_hit_img;
      this.loaded_images++;
    }
    spaceship_hit_img.src = '/assets/spaceship_hit.png';

    var bullet_img = new Image();
    bullet_img.onload = function() {
      _this.images[_this.BULLET_IMG] = bullet_img;
      this.loaded_images++;
    }
    bullet_img.src = '/assets/bullet.png';

    var background_img = new Image();
    background_img.onload = function() {
      _this.images[_this.BACKGROUND_IMG] = background_img;
      this.loaded_images++;
    }
    background_img.src = '/assets/space_background.png';
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
      console.log("Drawing image " + img_id);
      console.log("That image is " + this.images[img_id]);
      console.log(this.loaded_images + " images loaded");
      context.drawImage(this.images[img_id], x, y);
    }
  }
}
