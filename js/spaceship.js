/*
Spaceship class. Can be controlled via the handleControls() method.
*/
class Spaceship extends Sprite {

  constructor(id, x, y, texture_atlas) {  // TODO: SHOW_HEALTHBAR BOOLEAN (FALSE FOR PLAYER'S SHIP)
    super(id, x, y, TextureId.SPACESHIP_IMG,
      texture_atlas.getWidth(TextureId.SPACESHIP_IMG),
      texture_atlas.getHeight(TextureId.SPACESHIP_IMG), 100);

    // number of milliseconds to show healthbar for
    this.show_healthbar_ms = 0;
    // number of milliseconds to switch to the spaceship_hit
    // image. This makes the ship flash when hit
    this.show_hit_ms = 0;
    this.bullet_delay = 200;
    this.ms_since_last_bullet = this.bullet_delay;
    this.bullets_fired = 0;

    // used to play spritesheets
    this.anim_player = new SpritesheetPlayer();

    // save width/height of bullet image for future use
    this.bullet_img_width = texture_atlas.getWidth(TextureId.BULLET_IMG);
    this.bullet_img_height = texture_atlas.getHeight(TextureId.BULLET_IMG);

    // create spritesheet to be played when ship explodes
    this.explosion_spritesheet =
      new Spritesheet(TextureId.EXPLOSION_SPRITESHEET, texture_atlas,
        8, 30, false);

    // list of created bullets. Taken by the GameEngine
    this.bullet_queue = [];
  }

  // control update for the given number of milliseconds
  handleControls(ms, up_pressed, down_pressed, left_pressed, right_pressed, space_pressed) {
    if (up_pressed) {
      this.accel = 0.1;
      // create particle going in the other direction
      this.particles.push(new Particle(this.x, this.y,
        Math.PI + this.r_heading, this.speed, 900));
    }
    else if (!up_pressed) {
      // decellerate if up is not pressed
      this.accel = -0.05;
    }
    if (down_pressed) {
      this.accel = -0.1;
    }
    if (right_pressed) {
      this.r_heading += 0.0035 * ms;
      this.r_img_rotation = this.r_heading;
    }
    if (left_pressed) {
      this.r_heading -= 0.0035 * ms;
      this.r_img_rotation = this.r_heading;
    }
    if (space_pressed) {
      this.fireBullet();
    }
  }

  respawn() {

  }

  // (attempts to) fire a bullet. Makes sure ms_since_last_bullet >= bullet_delay
  fireBullet() {
    if (this.ms_since_last_bullet >= this.bullet_delay) {
      this.bullet_queue.push(new Bullet(-1, this.id, this.bullets_fired,
        this.x, this.y, this.r_heading, this.speed, this.bullet_img_width,
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
    else if (this.show_healthbar_ms <= ms) {
      this.show_healthbar_ms = 0;
    }

    if (this.show_hit_ms > ms) {
      this.show_hit_ms -= ms;
    }
    else if (this.show_hit_ms <= ms) {
      this.show_hit_ms = 0;
      // change back to regular texture
      this.img_id = TextureId.SPACESHIP_IMG;
    }

    this.ms_since_last_bullet += ms;

    // update animation (if any)
    this.anim_player.update(ms);

    // set to be destroyed if dead and explosion animation has played
    if (this.dead && this.anim_player.img_id == TextureId.EXPLOSION_SPRITESHEET_IMG &&
      this.anim_player.has_played) {
        this.destroy = true;
    }
  }

  onCollision(sprite) {
    Sprite.prototype.onCollision.call(this, sprite);

    // switch to spaceship_hit image if the collision did damage
    if (sprite.damage > 0) {
      this.show_hit_ms = 150;  // TODO: THIS SEEMS TO BE SHOWN FOR MUCH LONGER
      this.show_healthbar_ms = 250;
      this.img_id = TextureId.SPACESHIP_HIT_IMG;
    }
  }

  // set dead = true and play explosion animation
  onDeath() {
    this.dead = true;
    this.anim_player.setSpritesheet(this.explosion_spritesheet);
  }

  // calls super method and also draws healthbar above Spaceship if show_healthbar_ms > 0
  draw(context, texture_atlas, view_x, view_y) {
    Sprite.prototype.draw.call(this, context, texture_atlas, view_x, view_y);

    // draw animation (if any)
    this.anim_player.draw(context, texture_atlas,
      this.x - view_x, this.y - view_y);

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
