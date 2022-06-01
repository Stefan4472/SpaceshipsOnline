/*
Main Client code, which creates and starts the main Game instance.
*/
console.log("Client running main.js");

var client = null;
var canvas = document.getElementById("gameCanvas");
var game = null;
var asset_loader = new AssetLoader(480, 320, onAssetsLoaded);
asset_loader.load_assets();

function onAssetsLoaded() {
    console.log('Finished loading assets');
    // client = new Client();

    // // Socket listeners
    // client.socket.on('joined_game', function(data) {
    //     console.log(`Joined a lobby! Data received ${JSON.stringify(data, null, 2)}`);
    //     // game = new Game(client, canvas, data.your_id);
    // });

    // client.socket.on('game_update', function(game_state) {
    //     game.onGameUpdate(game_state); 
    // });
}