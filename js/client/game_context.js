/* Context for all things the Game needs. */
class GameContext {
    constructor(client, canvas, assets, my_id, game_width, game_height) {
        this.client = client;
        this.canvas = canvas;
        this.assets = assets;
        this.my_id = my_id;
        this.game_width = game_width;
        this.game_height = game_height;
    }
}