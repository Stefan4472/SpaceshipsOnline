/*
Draws the game's space background.
*/
class Background {
  constructor(game_context) {
    this.game_context = game_context;
  }

  // Draw the background to the given canvas context
  draw(drawer) {
    var w = this.game_context.screen_width;
    var h = this.game_context.screen_height;
    // console.log(`Drawing background ${w}, ${h}, ${drawer.offsetX}, ${drawer.offsetY}`);
    var src = new Rect(drawer.offsetX, drawer.offsetY, w, h);
    var dst = new Rect(drawer.offsetX, drawer.offsetY, w, h);
    drawer.drawSubImg(AssetId.BACKGROUND_IMG, src, dst);
  }
}
