import { Socket } from 'socket.io';

export class Player {
    public readonly id: string;
    public readonly ship_id: number;

    constructor(id: string, ship_id: number) {
        this.id = id;
        this.ship_id = ship_id;
    }
}
