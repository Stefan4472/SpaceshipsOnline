/*
Draws the game's space background. Repeats a specified tile image.
*/
class Background {
  constructor(map_width, map_height, screen_width, screen_height) {
    this.img_width = 0;
    this.img_height = 0;
    this.onready = function() { console.log("Background received onready()"); };

    var _this = this;
    this.img = new Image();
    this.img.onload = function() {
      console.log("Background image loaded");
      _this.img_width = _this.img.width;
      _this.img_height = _this.img.height;
      console.log("Background img w/h " + _this.img_width + ", " + _this.img_height);
      _this.onready();
    }
    this.img.src = '/assets/space_background.png';

    this.map_width = map_width;
    this.map_height = map_height;
    this.screen_width = screen_width;
    this.screen_height = screen_height;
    this.view_x = 0;
    this.view_y = 0;
  }

  center_to(x, y) {
    this.view_x = x - this.screen_width / 2;
    this.view_y = y - this.screen_height / 2;

    // ensure view window doesn't go off background edges
    if (this.view_x < 0) {
      this.view_x = 0;
    }
    else if (this.view_x + this.screen_width > this.map_width) {
      this.view_x = this.map_width - this.screen_width;
    }
    if (this.view_y < 0) {
      this.view_y = 0;
    }
    else if (this.view_y + this.screen_height > this.map_height) {
      this.view_y = this.map_height - this.screen_height;
    }
  }

  // draws img tile that starts at (start_x, start_y) to the screen, assuming
  // the screen starts at (view_x, view_y) from the top-left and has width/height
  // (screen_width, screen_height). Helper to draw()
  drawTile(context, start_x, start_y, view_x, view_y) {
    var src_x = 0, src_y = 0, src_w, src_h, dest_x, dest_y;

    if (start_x < view_x) {
      src_x = view_x - start_x;
      src_w = this.img_width - src_x;
      dest_x = 0;
    }
    else {
      src_x = 0;
      src_w = this.img_width - (start_x - view_x);
      dest_x = start_x - view_x;
    }

    // make sure width does not exceed image tile size
    src_w = src_x + src_w > this.img_width ? this.img_width - src_x : src_w;

    if (start_y < view_y) {
      src_y = view_y - start_y;
      src_h = this.img_height - src_y;
      dest_y = 0;
    }
    else {
      src_y = 0;
      src_h = this.img_height - (start_y - view_y);
      dest_y = start_y - view_y;
    }

    // make sure height does not exceed image tile size
    src_h = src_y + src_h > this.img_height ? this.img_height - src_y : src_h;

    context.drawImage(this.img, src_x, src_y, src_w, src_h,
      dest_x, dest_y, src_w, src_h);
  }

  // draw repeating background images, starting with (view_x, view_y) at screen top-left
  draw(context, texture_atlas) {
    var horizontal_tiles = this.screen_width / this.img_width + 1;
    var vertical_tiles = this.screen_height / this.img_height + 1;

    var img_offset_x = this.view_x % this.img_width;
    var img_offset_y = this.view_y % this.img_height;

    // figure out where image tile starts
    var tile_start_x = this.view_x - img_offset_x;
    var tile_start_y = this.view_y - img_offset_y;

    for (var i = tile_start_x; i < this.view_x + this.screen_width; i += this.img_width) {
      for (var j = tile_start_y; j < this.view_y + this.screen_height; j += this.img_height) {
        this.drawTile(context, i, j, this.view_x, this.view_y);
      }
    }
  }
}
