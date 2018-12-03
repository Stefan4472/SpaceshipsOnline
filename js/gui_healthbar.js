/*
Big healthbar drawn in top-right of the screen. Listens for health of a
given sprite and draws itself to the given context.
*/
class GuiHealthbar {
  constructor(sprite, screen_width, screen_height) {
    console.log("Creating gui healthbar. Screen w/h " + screen_width + ", " + screen_height);
    this.sprite = sprite;
    this.last_hp = sprite.hp;
    this.last_full_hp = sprite.full_hp;
    this.x = screen_width * 0.01;
    this.y = screen_height - 10;
    this.width = screen_width * 0.98;
    this.height = 8;
    this.fill_width = this.width * (sprite.hp * 1.0 / sprite.full_hp);
    this.color = "#00FF00";
  }

  update(ms) {
    // hp or full hp changed: recalculate healthbar params
    if (this.sprite.hp != this.last_hp ||
        this.sprite.last_full_hp != this.last_full_hp) {
      this.last_hp = this.sprite.hp;
      this.sprite.last_full_hp = this.sprite.full_hp;

      this.fill_width = this.width * (this.sprite.hp * 1.0 / this.sprite.full_hp);

      // TODO: COLOR CHANGE?
    }
  }

  // draw healthbar to canvas
  draw(context, texture_atlas) {
    // draw healthbar rectangle
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.fill_width, this.height);

    // draw number of bullets left
    context.fillStyle = '#FFFFFF';
    context.font = "30px Arial";
    context.fillText(this.sprite.ammo_left.toString(), this.x, this.y);
  }
}
