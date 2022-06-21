/* Store information about a player*/
export class Player {
    player_id: string;
    sprite_id: number;
    constructor(player_id: string, sprite_id: number) {
        this.player_id = player_id;
        this.sprite_id = sprite_id;
    }
}