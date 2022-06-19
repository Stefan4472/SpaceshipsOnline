import { io } from "socket.io-client";
import {AssetLoader} from "./asset_loader";
import {Client} from "./client";
import {Assets} from "./assets";
import {Messages} from "./messages";
import {GameContext} from "./game_context";
import {Game} from "./game";

// TODO: move into `Client` to fully abstract the details
const socket = io();
socket.on('connect', () => {
  console.log('Successfully connected!');
});

/*
Main Client code, which creates and starts the main Game instance.
*/
const SCREEN_WIDTH = 600;
const SCREEN_HEIGHT = 400;

let client: Client = null;
let game = null;
let context = null;
let canvas = <HTMLCanvasElement> document.getElementById("gameCanvas");
canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

new AssetLoader(onAssetsLoaded).load_assets();

function onAssetsLoaded(assets: Assets) {
    console.log('Finished loading assets');
    client = new Client(socket);
    client.socket.on(Messages.INIT_STATE, function(state) {
        console.log(`Joined a lobby! Data received ${JSON.stringify(state, null, 2)}`);
        context = new GameContext(client, canvas, assets, state.your_id, state.game_width, state.game_height, SCREEN_WIDTH, SCREEN_HEIGHT);
        game = new Game(context);
        game.start(state.state, state.players);
    });

    client.socket.on(Messages.GAME_UPDATE, function(game_state) {
        console.log(`Received a game update: ${JSON.stringify(game_state, null, 0)}`);
        game.onGameUpdate(game_state);
    });

    client.socket.on(Messages.PLAYER_JOINED, function(info) {
        game.onPlayerJoined(info.player_id, info.spaceship);
    });

    client.socket.on(Messages.PLAYER_LEFT, function(info) {
        game.onPlayerLeft(info);
    });
}