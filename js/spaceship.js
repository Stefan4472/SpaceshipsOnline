/*
Spaceship class. Can be controlled via the handleControls() method.
*/
class Spaceship extends Sprite {

  constructor(id, img, x, y) {
    super(id, img, x, y, 100);
    // number of milliseconds to show healthbar for
    this.show_healthbar_ms = 1000;
  }

  handleControls(up_pressed, down_pressed, left_pressed, right_pressed, space_pressed) {
    if (up_pressed)
    {
      this.accel = 2;
    }
    else if (!up_pressed)
    {
      // decellerate if up is not pressed
      this.accel = -1.0;
    }
    if (down_pressed)
    {
      this.accel = -2;
    }
    if (right_pressed)
    {
      this.radRotation += 0.09;
    }
    if (left_pressed)
    {
      this.radRotation -= 0.09;
    }
  }

  // calls sprite update() method and updates show_healthbar_ms
  update(ms) {
    Sprite.prototype.update.call(this, ms);

    console.log("Spaceship update method");
    if (this.show_healthbar_ms > ms) {
      this.show_healthbar_ms -= ms;
    }
    else if (this.show_healthbar_ms < ms) {
      this.show_healthbar_ms = 0;
    }
  }

  // calls super method and also draws healthbar above Spaceship if show_healthbar_ms > 0
  draw(context, view_x, view_y) {
    Sprite.prototype.draw.call(this, context, view_x, view_y);

    if (this.show_healthbar_ms > 0) {
      var percent_healthy = this.hp * 1.0 / this.full_hp;

      // determine healthbar fill depending on percent_healthy
      if (percent_healthy > 0.6) {
        context.fillStyle = "#00FF00";
      }
      else if (percent_healthy > 0.3) {
        context.fillStyle = "#FFFF00";
      }
      else {
        context.fillStyle = "#FF0000";
      }

      var healthbar_width = this.img_width * percent_healthy;

      // determine coordinates for healthbar rect and draw centered above spaceship
      context.fillRect(this.x + (this.img_width - healthbar_width) / 2 - view_x,
        this.y - 10 - view_y, healthbar_width, 6);
    }
  }
}
