/*Message names used in socket communication.*/
import {PlayerInput} from './player_input';

export enum MessageId {
    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    INIT_STATE = 'init_state',
    GAME_UPDATE = 'game_update',
    SEND_INPUT = 'send_input',
    PLAYER_LEFT = 'player_left',
    PLAYER_JOINED = 'player_joined',
}

export class InitMessage {
    your_id: string;
    players: Array<SerializedPlayer>;
    state: SerializedGameState;
    game_width: number;
    game_height: number;
    constructor(
        your_id: string,
        players: Array<SerializedPlayer>,
        state: SerializedGameState,
        game_width: number,
        game_height: number,
    ) {
        this.your_id = your_id;
        this.players = players;
        this.state = state;
        this.game_width = game_width;
        this.game_height = game_height;
    }
}

export class UpdateMessage {
    state: SerializedGameState;
    // Inputs changed since the previous update
    changedInputs: Array<PlayerInput>;
    constructor(state: SerializedGameState, changedInputs: Array<PlayerInput>) {
        this.state = state;
        this.changedInputs = changedInputs;
    }
}

export class InputMessage {
    input: PlayerInput;
    constructor(input: PlayerInput) {
        this.input = input;
    }
}

export class PlayerLeftMessage {
    player_id: string;
    constructor(player_id: string) {
        this.player_id = player_id;
    }
}

export class PlayerJoinedMessage {
    player_id: string;
    username: string;
    spaceship: SerializedSpaceship;
    constructor(player_id: string, username: string, spaceship: SerializedSpaceship) {
        this.player_id = player_id;
        this.username = username;
        this.spaceship = spaceship;
    }
}

export class SerializedPlayer {
    player_id: string;
    sprite_id: number;
    username: string;
    constructor(player_id: string, sprite_id: number, username: string) {
        this.player_id = player_id;
        this.sprite_id = sprite_id;
        this.username = username;
    }
}

export class SerializedSpaceship {
    sprite_id: number;
    x: number;
    y: number;
    rotation: number;
    speed: number;
    acceleration: number;
    constructor(sprite_id: number, x: number, y: number, heading: number, speed: number, accel: number) {
        this.sprite_id = sprite_id;
        this.x = x;
        this.y = y;
        this.rotation = heading;
        this.speed = speed;
        this.acceleration = accel;
    }
}

export class SerializedGameState {
    spaceships: Array<SerializedSpaceship>;
    constructor(spaceships: Array<SerializedSpaceship>) {
        this.spaceships = spaceships;
    }
}
