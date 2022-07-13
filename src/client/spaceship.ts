/*
Static enum for setting control of accel/decel (forward, backward, none).
*/
// var UP_DOWN_CONTROL = {};
// UP_DOWN_CONTROL.FORWARDS = 1;
// UP_DOWN_CONTROL.BACKWARDS = -1;
// UP_DOWN_CONTROL.NONE = 0;

/*
Static enum for setting control of turning (right, left, none).
*/
// var LEFT_RIGHT_CONTROL = {};
// LEFT_RIGHT_CONTROL.RIGHT = 1;
// LEFT_RIGHT_CONTROL.LEFT = -1;
// LEFT_RIGHT_CONTROL.NONE = 0;

import {GameContext} from './game_context';
import {ControlState} from '../shared/player_input';
import {Drawer} from './drawer';
import {AssetId} from './assets';
import {SerializedSpaceship} from "../shared/messages";

export class Spaceship {
    game_context: GameContext;
    readonly sprite_id: number;
    readonly player_id: string;
    readonly username: string;
    x: number = 0;
    y: number = 0;
    rotation: number = 0;
    speed: number = 0;
    acceleration: number = 0;
    width: number;
    height: number;
    input: ControlState = new ControlState();
    readonly max_speed: number = 0.3;

    constructor(
        game_context: GameContext,
        sprite_id: number,
        player_id: string,
        username: string,
        x: number,
        y: number,
        heading: number,
    ) {
        this.game_context = game_context;
        this.sprite_id = sprite_id;
        this.player_id = player_id;
        this.username = username;
        this.x = x;
        this.y = y;
        this.rotation = heading;
        this.width = this.game_context.assets.getById(AssetId.SPACESHIP_IMG).width;
        this.height = this.game_context.assets.getById(AssetId.SPACESHIP_IMG).height;

        // Used to play spritesheets
        // this.anim_player = new SpritesheetPlayer();

        // create spritesheet to be played when ship explodes
        // this.explosion_spritesheet =
        //   new Spritesheet(
        //       TextureId.EXPLOSION_SPRITESHEET, this.game_context.texture_atlas, 8, 30, false);
    }

    setInput(input: ControlState) {
        this.input = input;
    }

    // calls sprite update() method and updates show_healthbar_ms
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
        }

        this.speed += this.acceleration * ms;
        // Normalize speed to [0, max_speed]
        if (this.speed > this.max_speed) {
            this.speed = this.max_speed;
        } else if (this.speed < 0) {
            this.speed = 0;
        }

        const dx = this.speed * ms * Math.cos(this.rotation);
        const dy = this.speed * ms * Math.sin(this.rotation);

        // move by speed pixels in direction specified by r_heading
        this.x += dx;
        this.y += dy;

        // Update animation (if any)
        // this.anim_player.update(ms);
    }

    // calls super method and also draws healthbar above Spaceship if show_healthbar_ms > 0
    draw(drawer: Drawer) {

        // Draw Spaceship sprite
        drawer.drawImg(AssetId.SPACESHIP_IMG, this.x, this.y, this.rotation);

        if (this.player_id !== this.game_context.my_id) {
            // Print username below ship *if not the player*
            drawer.drawText(this.username, this.x, this.y+this.height, '16px Arial', 'white');
        }

        // draw animation (if any)
        // this.anim_player.draw(draw_context, this.game_context.texture_atlas,
        //   this.x - view_x, this.y - view_y);

        // if (this.show_healthbar_ms > 0) {
        //   var percent_healthy = this.hp * 1.0 / this.full_hp;
        //
        //   // determine healthbar fill depending on percent_healthy
        //   if (percent_healthy > 0.6) {
        //     draw_context.fillStyle = "#00FF00";
        //   }
        //   else if (percent_healthy > 0.3) {
        //     draw_context.fillStyle = "#FFFF00";
        //   }
        //   else {
        //     draw_context.fillStyle = "#FF0000";
        //   }
        //
        //   // var healthbar_width = this.img_width * percent_healthy;
        //
        //   // determine coordinates for healthbar rect and draw centered above spaceship
        //   // draw_context.fillRect(this.x + (this.img_width - healthbar_width) / 2 - view_x,
        //   //   this.y - 10 - view_y, healthbar_width, 6);
        // }
    }

    serialize(): SerializedSpaceship {
        return new SerializedSpaceship(this.sprite_id, this.x, this.y, this.rotation, this.speed, this.acceleration);
    }
}
