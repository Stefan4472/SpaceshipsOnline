import {Socket} from 'socket.io'

export class Player {
    public readonly id: number;
    public readonly ship_id: number;
    public socket: Socket;

    constructor(id: number, ship_id: number, socket: Socket) {
        this.id = id;
        this.ship_id = ship_id;
        this.socket = socket;
    }
}

export class PlayerInfo {
    public id: number;
    public sprite_id: number;
    constructor(id: number, sprite_id: number) {
        this.id = id;
        this.sprite_id = sprite_id;
    }
}