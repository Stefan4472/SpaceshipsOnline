import { ControlState } from '../shared/player_input';
import { SerializedSpaceship } from '../shared/messages';
import {applyControls, Physics} from "../shared/physics";

export class Spaceship {
    readonly sprite_id: number;
    readonly player_id: string;
    private physics : Physics;
    // Current input
    private input: ControlState = new ControlState();

    constructor(sprite_id: number, player_id: string, x: number, y: number, rotation: number) {
        this.sprite_id = sprite_id;
        this.player_id = player_id;
        this.physics = new Physics(x, y, rotation, 0.3);
    }

    setInput(player_input: ControlState) {
        this.input = player_input;
    }

    update(ms: number) {
        applyControls(this.physics, this.input);
        this.physics.simulate(ms);
    }

    serialize(): SerializedSpaceship {
        return new SerializedSpaceship(this.sprite_id, this.physics);
    }
}
