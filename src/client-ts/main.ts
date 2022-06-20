import { io } from "socket.io-client";
import {AssetLoader} from "./asset_loader";
import {Client} from "./client";
import {Assets} from "./assets";
import {InitMessage, MessageId, PlayerJoinedMessage, PlayerLeftMessage, UpdateMessage} from "./messages";
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
    client.socket.on(MessageId.INIT_STATE, function(message: InitMessage) {
        console.log(`Joined a lobby! Data received ${JSON.stringify(message, null, 2)}`);
        context = new GameContext(client, canvas, assets, message.your_id, message.game_width, message.game_height, SCREEN_WIDTH, SCREEN_HEIGHT);
        game = new Game(context);
        game.start(message.spaceships, message.players);
    });

    client.socket.on(MessageId.GAME_UPDATE, function(message: UpdateMessage) {
        console.log(`Received a game update: ${JSON.stringify(message, null, 0)}`);
        game.onGameUpdate(message.spaceships);
    });

    client.socket.on(MessageId.PLAYER_JOINED, function(message: PlayerJoinedMessage) {
        game.onPlayerJoined(message.player_id, message.spaceship);
    });

    client.socket.on(MessageId.PLAYER_LEFT, function(message: PlayerLeftMessage) {
        game.onPlayerLeft(message.player_id);
    });
}