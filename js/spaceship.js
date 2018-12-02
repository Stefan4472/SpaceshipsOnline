/*
Static enum for distinguishing left and right cannons.
*/
var CannonEnum = {};
CannonEnum.LEFT = 0;
CannonEnum.RIGHT = 1;

/*
Spaceship class. Can be controlled via the handleControls() method.
*/
class Spaceship extends Sprite {

  constructor(id, x, y, texture_atlas) {  // TODO: SHOW_HEALTHBAR BOOLEAN (FALSE FOR PLAYER'S SHIP)
    super(id, SpriteType.SPACESHIP, x, y, texture_atlas);

    // get reference to texture_atlas
    this.texture_atlas = texture_atlas;

    // number of milliseconds to show healthbar for
    this.show_healthbar_ms = 0;
    // number of milliseconds to switch to the spaceship_hit
    // image. This makes the ship flash when hit
    this.show_hit_ms = 0;
    this.bullet_delay = 200;
    this.ms_since_last_bullet = this.bullet_delay;
    this.bullets_fired = 0;
    this.last_cannon_fired = CannonEnum.RIGHT;

    // used to play spritesheets
    this.anim_player = new SpritesheetPlayer();

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
      var cannon_to_fire = this.last_cannon_fired == CannonEnum.LEFT ?
        CannonEnum.RIGHT : CannonEnum.LEFT;

      // determine fire point TODO: SWITCH BETWEEN LEFT AND RIGHT CANNONS
      var fire_point = cannon_to_fire == CannonEnum.LEFT ?
        this.getLeftFirePoint() : this.getRightFirePoint();

      this.bullet_queue.push(new Bullet(-1, this.id, this.bullets_fired,
        fire_point.x, fire_point.y, this.r_heading, this.speed,
        this.texture_atlas));

      this.bullets_fired++;
      this.ms_since_last_bullet = 0;
      this.last_cannon_fired = cannon_to_fire;
    }
  }

  // return {x, y} coordinate for left cannon
  getLeftFirePoint() {
    var center_x = this.x + this.img_width / 2;
    var center_y = this.y + this.img_height / 2;

    // left fire point is at (+14, -10) from center
    var fire_point_x = center_x + 14 * Math.cos(this.r_heading) +
      10 * Math.sin(this.r_heading);
    var fire_point_y = center_y - 10 * Math.cos(this.r_heading) +
      14 * Math.sin(this.r_heading);

    return {
      x: fire_point_x,
      y: fire_point_y
    };
  }

  // return {x, y} coordinate for right cannon
  getRightFirePoint() {
    var center_x = this.x + this.img_width / 2;
    var center_y = this.y + this.img_height / 2;

    // right fire point is at (+14, +8) from center
    var fire_point_x = center_x + 14 * Math.cos(this.r_heading) -
      8 * Math.sin(this.r_heading);
    var fire_point_y = center_y + 8 * Math.cos(this.r_heading) +
      14 * Math.sin(this.r_heading);

    return {
      x: fire_point_x,
      y: fire_point_y
    };
  }

  // returns a particle generated by the engine.
  // randomly decides which engine the particle will exit from (left or right)
  // and where exactly along the engine it will be generated
  generateEngineParticle() {
    var center_x = this.x + this.img_width / 2;
    var center_y = this.y + this.img_height / 2;

    var eng_offset_x = -20;
    var eng_offset_y;

    // TODO: DON'T DISTINGUISH BETWEEN LEFT AND RIGHT ENGINES
    if (Math.random() < 0.5) {  // left engine TODO: CHECK MATH, ESP RANDOM NUMBER RANGE
      eng_offset_y = -17 + Math.floor(Math.random() * 6);
    }
    else {  // right engine
      eng_offset_y = 6 + Math.floor(Math.random() * 6);
    }

    var particle_x = center_x + eng_offset_x * Math.cos(this.r_heading) -
      eng_offset_y * Math.sin(this.r_heading);
    var particle_y = center_y + eng_offset_y * Math.cos(this.r_heading) +
      eng_offset_y * Math.sin(this.r_heading);

    return new Particle(particle_x, particle_y, Math.PI + this.r_heading,
      this.speed / 2, 1000);  // TODO: RANDOMIZE DISTANCE?
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

    // create particle exiting one of the engines if accel > 0
    if (this.accel > 0) {
      this.particles.push(this.generateEngineParticle());
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
