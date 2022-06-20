/*Message names used in socket communication.*/
// TODO: share with server
import {PlayerInput} from "./player_input";

export enum MessageId {
    INIT_STATE = 'init_state',
    GAME_UPDATE = 'game_update',
    SEND_INPUT = 'send_input',
    PLAYER_LEFT = 'player_left',
    PLAYER_JOINED = 'player_joined',
}

export class InitMessage {
    your_id: number;
    players: Array<SerializedPlayer>;
    spaceships: Array<SerializedSpaceship>;
    game_width: number;
    game_height: number;
    constructor(your_id: number, players: Array<SerializedPlayer>, spaceships: Array<SerializedSpaceship>, game_width: number, game_height: number) {
        this.your_id = your_id;
        this.players = players;
        this.spaceships = spaceships;
        this.game_width = game_width;
        this.game_height = game_height;
    }
}

export class UpdateMessage {
   spaceships: Array<SerializedSpaceship>;
   constructor(spaceships: Array<SerializedSpaceship>) {
       this.spaceships = spaceships;
   }
}

export class InputMessage {
    input: PlayerInput;
    constructor(input: PlayerInput) {
        this.input = input;
    }
}

export class PlayerLeftMessage {
    player_id: number;
    constructor(player_id: number) {
        this.player_id = player_id;
    }
}

export class PlayerJoinedMessage {
    player_id: number;
    spaceship: SerializedSpaceship;
    constructor(player_id: number, spaceship: SerializedSpaceship) {
        this.player_id = player_id;
        this.spaceship = spaceship;
    }
}

export class SerializedPlayer {
    player_id: number;
    sprite_id: number;
    constructor(player_id: number, sprite_id: number) {
        this.player_id = player_id;
        this.sprite_id = sprite_id;
    }
}

export class SerializedSpaceship {
    sprite_id: number;
    x: number;
    y: number;
    heading: number;
    speed: number;
    accel: number;
    constructor(sprite_id: number, x: number, y: number, heading: number, speed: number, accel: number) {
        this.sprite_id = sprite_id;
        this.x = x;
        this.y = y;
        this.heading = heading;
        this.speed = speed;
        this.accel = accel;
    }
}