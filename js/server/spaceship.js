var PlayerInput = require('./../shared/player_input.js').PlayerInput;

class Spaceship {
    constructor(sprite_id, x, y, heading) {
        this.sprite_id = sprite_id;
        this.x = x;
        this.y = y;
        this.heading = heading;
        
        // Current input
        this.input = new PlayerInput();
    }

    setInput(player_input) {
        this.input = player_input;
    }

    update(ms) {
        // Accelerate when up_pressed, otherwise decellerate slowly
        if (this.input.up) {
          this.accel = 0.1;
        }
        else {
          this.accel = -0.05;
        }
        // Quickly decellerate when down_pressed
        if (this.input.down) {
          this.accel = -0.1;
        }
        // Rotate when turning
        if (this.input.right) {
          this.r_heading += 0.0035 * ms;
          this.r_img_rotation = this.r_heading;
        }
        if (this.input.left) {
          this.r_heading -= 0.0035 * ms;
          this.r_img_rotation = this.r_heading;
        }

        this.speed += this.accel * ms;
        // Normalize speed to [0, max_speed]
        if (this.speed > this.max_speed) {
            this.speed = this.max_speed;
        }
        else if (this.speed < 0) {
            this.speed = 0;
        }

        // Move by speed pixels in direction specified by r_heading
        var dx = this.speed * ms * Math.cos(this.r_heading);
        var dy = this.speed * ms * Math.sin(this.r_heading);
        
        this.x += dx;
        this.y += dy;
    }

    serialize() {
        return {
            sprite_id: this.id,
            x: this.x,
            y: this.y,
            heading: this.heading,
            speed: this.speed,
            accel: this.accel,
        };
    }
}

module.exports.Spaceship = Spaceship;