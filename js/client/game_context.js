/* Context for all things the Game needs. */
class GameContext {
    constructor(client, canvas, assets, texture_atlas, my_id, game_width, game_height, screen_width, screen_height) {
        this.client = client;
        this.canvas = canvas;  // TODO: not sure if this belongs here
        this.assets = assets;
        this.texture_atlas = texture_atlas;
        this.my_id = my_id;
        this.game_width = game_width;
        this.game_height = game_height;
        this.screen_width = screen_width;
        this.screen_height = screen_height;
    }
}