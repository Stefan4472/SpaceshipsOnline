/*
Main Client code, which creates and starts the main Game instance.
*/
const SCREEN_WIDTH = 800;
const SCREEN_HEIGHT = 600;

var client = null;
var game = null;
var context = null;
var canvas = document.getElementById("gameCanvas");
canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

new AssetLoader(onAssetsLoaded).load_assets();

function onAssetsLoaded(assets) {
    console.log('Finished loading assets');
    client = new Client();

    client.socket.on(Messages.INIT_STATE, function(state) {
        console.log(`Joined a lobby! Data received ${JSON.stringify(state, null, 2)}`);
        context = new GameContext(client, canvas, assets, state.your_id, state.game_width, state.game_height, SCREEN_WIDTH, SCREEN_HEIGHT);
        game = new Game(context);
    });

    client.socket.on(Messages.GAME_UPDATE, function(game_state) {
        console.log(`Received a game update: ${JSON.stringify(game_state, null, 0)}`);
        game.onGameUpdate(game_state); 
    });

    client.socket.on(Messages.PLAYER_JOINED, function(info) {
        game.onPlayerJoined(info);
    });

    client.socket.on(Messages.PLAYER_LEFT, function(info) {
        game.onPlayerLeft(info);
    });
}