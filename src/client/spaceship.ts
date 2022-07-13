import {GameContext} from './game_context';
import {ControlState} from '../shared/player_input';
import {Drawer} from './drawer';
import {AssetId} from './assets';
import {SerializedSpaceship} from "../shared/messages";
import {Physics} from "../shared/physics";

export class Spaceship {
    game_context: GameContext;
    readonly sprite_id: number;
    readonly player_id: string;
    readonly username: string;
    private physics : Physics;
    width: number;
    height: number;
    input: ControlState = new ControlState();

    constructor(
        game_context: GameContext,
        sprite_id: number,
        player_id: string,
        username: string,
        x: number,
        y: number,
        rotation: number,
    ) {
        this.game_context = game_context;
        this.sprite_id = sprite_id;
        this.player_id = player_id;
        this.username = username;
        this.physics = new Physics(x, y, rotation);
        this.width = this.game_context.assets.getById(AssetId.SPACESHIP_IMG).width;
        this.height = this.game_context.assets.getById(AssetId.SPACESHIP_IMG).height;
    }

    get x(): number {
        return this.physics.x;
    }

    get y(): number {
        return this.physics.y;
    }

    setInput(input: ControlState) {
        this.input = input;
    }

    syncToAuth(auth: Physics) {
        // Snap to TODO: easing vs snapping
        this.physics.x = auth.x;
        this.physics.y = auth.y;
        this.physics.rotation = auth.rotation;
        this.physics.rotationSpeed = auth.rotationSpeed;
        this.physics.speed = auth.speed;
        this.physics.acceleration = auth.acceleration;
    }

    update(ms: number) {
        // TODO: this is copied from server/spaceship.ts
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

    // calls super method and also draws healthbar above Spaceship if show_healthbar_ms > 0
    draw(drawer: Drawer) {
        // Draw Spaceship sprite
        drawer.drawImg(AssetId.SPACESHIP_IMG, this.physics.x, this.physics.y, this.physics.rotation);

        if (this.player_id !== this.game_context.my_id) {
            // Print username below ship *if not the player*
            drawer.drawText(this.username, this.physics.x, this.physics.y+this.height, '16px Arial', 'white');
        }
    }

    serialize(): SerializedSpaceship {
        return new SerializedSpaceship(this.sprite_id, this.physics);
    }
}
