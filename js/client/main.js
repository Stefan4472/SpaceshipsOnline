/*
Main Client code, which creates and starts the main Game instance.
*/
var client = null;
var game = null;
var context = null;
var canvas = document.getElementById("gameCanvas");
new AssetLoader(480, 320, onAssetsLoaded).load_assets();

function onAssetsLoaded(assets) {
    console.log('Finished loading assets');
    client = new Client();

    // Socket listeners
    client.socket.on('joined_game', function(data) {
        console.log(`Joined a lobby! Data received ${JSON.stringify(data, null, 2)}`);
        context = new GameContext(client, canvas, assets, data.your_id, 480, 320);
        game = new Game(context);
    });

    client.socket.on('game_update', function(game_state) {
        game.onGameUpdate(game_state); 
    });
}