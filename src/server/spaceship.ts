import { ControlState } from '../shared/player_input';
import { SerializedSpaceship } from '../shared/messages';
import {Physics} from "../shared/physics";

export class Spaceship {
    readonly sprite_id: number;
    readonly player_id: string;
    private physics : Physics;
    // Current input
    private input: ControlState = new ControlState();
    readonly max_speed: number = 0.3;

    constructor(sprite_id: number, player_id: string, x: number, y: number, rotation: number) {
        this.sprite_id = sprite_id;
        this.player_id = player_id;
        this.physics = new Physics(x, y, rotation);
    }

    setInput(player_input: ControlState) {
        this.input = player_input;
    }

    update(ms: number) {
        if (this.input.up) {
            this.physics.acceleration = 0.1;
        } else if (this.input.down) {
            // Quickly decellerate when down pressed
            this.physics.acceleration = -0.1;
        } else {
            // Slowly decellerate when no input is given
            this.physics.acceleration = -0.05;
        }

        if (this.input.right) {
            this.physics.rotationSpeed = 0.0035;
        }
        if (this.input.left) {
            this.physics.rotationSpeed = -0.0035;
        }

        this.physics.simulate(ms);
    }

    serialize(): SerializedSpaceship {
        return new SerializedSpaceship(this.sprite_id, this.physics);
    }
}
