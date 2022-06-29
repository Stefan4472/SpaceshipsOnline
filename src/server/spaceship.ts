import { PlayerInput } from '../shared/player_input';
import { SerializedSpaceship } from '../shared/messages';

export class Spaceship {
    public sprite_id: number;
    public player_id: string;
    public x: number;
    public y: number;
    public heading: number;
    public accel: number;
    public speed: number;
    // TODO: make const
    public max_speed: number;
    private curr_input: PlayerInput;

    constructor(sprite_id: number, player_id: string, x: number, y: number, heading: number) {
        this.sprite_id = sprite_id;
        this.player_id = player_id;
        this.x = x;
        this.y = y;
        this.heading = heading;
        this.accel = 0;
        this.speed = 0;
        this.max_speed = 0.3;
        // Current input
        this.curr_input = new PlayerInput();
    }

    setInput(player_input: PlayerInput) {
        this.curr_input = player_input;
    }

    update(ms: number) {
        // Accelerate when up_pressed, otherwise decellerate slowly
        if (this.curr_input.up) {
            this.accel = 0.1;
        } else {
            this.accel = -0.05;
        }
        // Quickly decellerate when down_pressed
        if (this.curr_input.down) {
            this.accel = -0.1;
        }
        // Rotate when turning
        if (this.curr_input.right) {
            this.heading += 0.0035 * ms;
            // this.r_img_rotation = this.r_heading;
        }
        if (this.curr_input.left) {
            this.heading -= 0.0035 * ms;
            // this.r_img_rotation = this.r_heading;
        }

        this.speed += this.accel * ms;
        // Normalize speed to [0, max_speed]
        if (this.speed > this.max_speed) {
            this.speed = this.max_speed;
        } else if (this.speed < 0) {
            this.speed = 0;
        }

        // Move by speed pixels in direction specified by r_heading
        const dx = this.speed * ms * Math.cos(this.heading);
        const dy = this.speed * ms * Math.sin(this.heading);

        this.x += dx;
        this.y += dy;
    }

    serialize(): SerializedSpaceship {
        return new SerializedSpaceship(this.sprite_id, this.x, this.y, this.heading, this.speed, this.accel);
    }
}
