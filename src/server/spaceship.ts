import { ControlState } from '../shared/player_input';
import { SerializedSpaceship } from '../shared/messages';

export class Spaceship {
    readonly sprite_id: number;
    readonly player_id: string;
    x: number = 0;
    y: number = 0;
    rotation: number = 0;
    speed: number = 0;
    acceleration: number = 0;
    // Current input
    private input: ControlState = new ControlState();
    readonly max_speed: number = 0.3;

    constructor(sprite_id: number, player_id: string, x: number, y: number, heading: number) {
        this.sprite_id = sprite_id;
        this.player_id = player_id;
        this.x = x;
        this.y = y;
        this.rotation = heading;
    }

    setInput(player_input: ControlState) {
        this.input = player_input;
    }

    update(ms: number) {
        // Accelerate when up_pressed, otherwise decellerate slowly
        if (this.input.up) {
            this.acceleration = 0.1;
        } else {
            this.acceleration = -0.05;
        }
        // Quickly decellerate when down_pressed
        if (this.input.down) {
            this.acceleration = -0.1;
        }
        // Rotate when turning
        if (this.input.right) {
            this.rotation += 0.0035 * ms;
            // this.r_img_rotation = this.r_heading;
        }
        if (this.input.left) {
            this.rotation -= 0.0035 * ms;
            // this.r_img_rotation = this.r_heading;
        }

        this.speed += this.acceleration * ms;
        // Normalize speed to [0, max_speed]
        if (this.speed > this.max_speed) {
            this.speed = this.max_speed;
        } else if (this.speed < 0) {
            this.speed = 0;
        }

        // Move by speed pixels in direction specified by r_heading
        const dx = this.speed * ms * Math.cos(this.rotation);
        const dy = this.speed * ms * Math.sin(this.rotation);

        this.x += dx;
        this.y += dy;
    }

    serialize(): SerializedSpaceship {
        return new SerializedSpaceship(this.sprite_id, this.x, this.y, this.rotation, this.speed, this.acceleration);
    }
}
