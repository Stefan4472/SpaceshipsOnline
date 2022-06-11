/*
Draws the game's space background.
*/
class Background {
  constructor(game_context) {
    this.game_context = game_context;
    this.image = game_context.assets.background_img;
    // Top-left coordinates of player's view
    this.view_x = 0;
    this.view_y = 0;
  }

  center_to(x, y) {
    this.view_x = x - this.game_context.screen_width / 2;
    this.view_y = y - this.game_context.screen_height / 2;

    // Ensure view doesn't go off the map
    if (this.view_x < 0) {
      this.view_x = 0;
    } else if (this.view_x + this.game_context.screen_width > this.game_context.game_width) {
      this.view_x = this.game_context.game_width - this.game_context.screen_width;
    }
    if (this.view_y < 0) {
      this.view_y = 0;
    }
    else if (this.view_y + this.game_context.screen_height > this.game_context.game_height) {
      this.view_y = this.game_context.game_height - this.game_context.screen_height;
    }
  }

  // Draw the background to the given canvas context
  draw(draw_context) {
    console.log('Drawing background');
    // SRC to DST
    var w = this.game_context.screen_width;
    var h = this.game_context.screen_height;
    // console.log(`Drawing background at ${this.view_x} ${this.view_y} with w/h ${w} ${h}`);
    draw_context.drawImage(
      this.image, 
      this.view_x, this.view_y, w, h, 
      0, 0, w, h
    );
  }
}
