class Spaceship {
    constructor(sprite_id, x, y, heading) {
        this.sprite_id = sprite_id;
        this.x = x;
        this.y = y;
        this.heading = heading;
        
        // Current input
        this.up_pressed = false;
        this.down_pressed = false;
        this.left_pressed = false;
        this.right_pressed = false;
        this.space_pressed = false;
    }

    setInput(up, down, left, right, space) {
        this.up_pressed = up;
        this.down_pressed = down;
        this.left_pressed = left;
        this.right_pressed = right;
        this.space_pressed = space;
    }

    update(ms) {
        // Accelerate when up_pressed, otherwise decellerate slowly
        if (this.up_pressed) {
          this.accel = 0.1;
        }
        else {
          this.accel = -0.05;
        }
        // Quickly decellerate when down_pressed
        if (this.down_pressed) {
          this.accel = -0.1;
        }
        // Rotate when turning
        if (this.right_pressed) {
          this.r_heading += 0.0035 * ms;
          this.r_img_rotation = this.r_heading;
        }
        if (this.left_pressed) {
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