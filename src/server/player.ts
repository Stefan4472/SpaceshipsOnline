import {SerializedPlayer} from "../shared/messages";

export class Player {
    readonly id: string;
    readonly ship_id: number;
    readonly username: string;

    constructor(id: string, ship_id: number, username: string) {
        this.id = id;
        this.ship_id = ship_id;
        this.username = username;
    }

    serialize() : SerializedPlayer {
        return new SerializedPlayer(this.id, this.ship_id, this.username);
    }
}
