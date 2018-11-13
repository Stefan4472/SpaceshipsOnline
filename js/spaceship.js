/*
Spaceship class. Can be controlled via the handleControls() method.
*/
class Spaceship extends Sprite {

  constructor(id, x, y, texture_atlas) {  // TODO: SHOW_HEALTHBAR BOOLEAN (FALSE FOR PLAYER'S SHIP)
    super(id, x, y, texture_atlas.SPACESHIP_IMG,
      texture_atlas.getWidth(texture_atlas.SPACESHIP_IMG),
      texture_atlas.getHeight(texture_atlas.SPACESHIP_IMG), 100);

    // number of milliseconds to show healthbar for
    this.show_healthbar_ms = 1000;
    this.bullet_delay = 200;
    this.ms_since_last_bullet = this.bullet_delay;
    this.bullets_fired = 0;

    // save width/height of bullet image for future use
    this.bullet_img_width = texture_atlas.getWidth(texture_atlas.BULLET_IMG);
    this.bullet_img_height = texture_atlas.getHeight(texture_atlas.BULLET_IMG);

    // list of created bullets. Taken by the GameEngine
    this.bullet_queue = [];
  }

  handleControls(up_pressed, down_pressed, left_pressed, right_pressed, space_pressed) {
    if (up_pressed) {
      this.accel = 2;
      // create particle going in the other direction
      this.particles.push(new Particle(this.x, this.y,
        Math.PI + this.radRotation, -this.speed, 3, "#FFFF00", 900));
    }
    else if (!up_pressed) {
      // decellerate if up is not pressed
      this.accel = -1.0;
    }
    if (down_pressed) {
      this.accel = -2;
    }
    if (right_pressed) {
      this.radRotation += 0.09;
    }
    if (left_pressed) {
      this.radRotation -= 0.09;
    }
    if (space_pressed) {
      this.fireBullet();
    }
  }

  // (attempts to) fire a bullet. Makes sure ms_since_last_bullet >= bullet_delay
  fireBullet() {
    if (this.ms_since_last_bullet >= this.bullet_delay) {
      this.bullet_queue.push(new Bullet(-1, this.id, this.bullets_fired,
        this.x, this.y, this.radRotation, this.bullet_img_width,
        this.bullet_img_height));

      this.bullets_fired++;
      this.ms_since_last_bullet = 0;
    }
  }

  // calls sprite update() method and updates show_healthbar_ms
  update(ms) {
    Sprite.prototype.update.call(this, ms);

    if (this.show_healthbar_ms > ms) {
      this.show_healthbar_ms -= ms;
    }
    else if (this.show_healthbar_ms < ms) {
      this.show_healthbar_ms = 0;
    }

    this.ms_since_last_bullet += ms;
  }

  // calls super method and also draws healthbar above Spaceship if show_healthbar_ms > 0
  draw(context, texture_atlas, view_x, view_y) {
    Sprite.prototype.draw.call(this, context, texture_atlas, view_x, view_y);

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
