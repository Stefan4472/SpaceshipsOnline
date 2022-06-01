/*
Main Client code, which creates and starts the main Game instance.
*/
console.log("Client running main.js");

var canvas = document.getElementById("gameCanvas");

var client = new Client();
var ingame = false;
this.player_id = -1;

// Create the game instance
game = new Game(canvas);
// Connected players, mapped by playerID
players = new Map();

// setup socket message handlers
client.socket.on('you_joined_lobby',
    function(data) { onLobbyJoined(data); });
client.socket.on('player_joined_lobby',
    function(data) { onPlayerJoined(data); });
client.socket.on('disconnected',
    function(reason) { onDisconnect(reason); });
client.socket.on('player_disconnected',
    function(data) { onPlayerDisconnected(data); });
client.socket.on('lobby_start_countdown',
    function(ms_left) { onLobbyStartCountdown(ms_left); });
client.socket.on('init_state',
    function(state) { onReceiveInitState(state); });
client.socket.on('game_start_countdown',
    function(ms_left) { onGameStartCountdown(ms_left); });
client.socket.on('game_update',
    function(game_state) { onGameUpdate(game_state); });
client.socket.on('respawn_countdown',
    function(ms_left) { onRespawnCountdown(ms_left); });  // TODO
client.socket.on('game_over',
    function() { onGameOver(); });
client.socket.on('ping_request',
    function(data) { onPingRequest(data); });
client.socket.on('lobby_closed',
    function(reason) { onLobbyClosed(reason); });

function onLobbyJoined(data) {
    console.log(`Joined a lobby! Data received ${JSON.stringify(data, null, 2)}`);
    
    player_id = data.your_id;

    // save connected player data
    for (var player of data.player_data) {
        players.set(player.player_id, { username: player.username });
    }
}

function onPlayerJoined(player_data) {
    console.log("A player joined the lobby with id " + player_data.player_id +
        " and username " + player_data.username);
    players.set(player_data.player_id, { username: player_data.username });
}

function onDisconnect(reason) {
    console.log("You got disconnected for reason: '" + reason + "'");
    game.onGameTerminated();
}

// TODO: GAME LOG HANDLES
function onPlayerDisconnected(data) {
    console.log("Player with username " + data.player_id + " disconnected");
  
    if (in_game) {
        game.onPlayerDisconnected(data.player_id);
    }
}

function onLobbyStartCountdown(ms_left) {
    console.log("Lobby starting in " + (ms_left / 1000) + " seconds");

    // switch to game screen
    if (ms_left <= 0) {
        in_game = true;
    }
}

function onReceiveInitState(state) {
  // pass along to the game
    game.onReceiveInitState(player_id, players, state);
}

function onGameStartCountdown(ms_left) {
    game.onGameStartCountdown(ms_left);
}

function onGameUpdate(game_state) {
    game.onGameUpdate(game_state);
}

function onRespawnCountdown(ms_left) {  // TODO

}

function onGameOver() {
    game.onGameOver();
}

function onPingRequest(data) {
    console.log("Received a ping request with id " + data.ping_id);
    client.socket.emit('ping_response', data.ping_id);
}

function onLobbyClosed(message) {
    game.onGameTerminated();
    console.log("Lobby was closed, reason: '" + message + "'");
}